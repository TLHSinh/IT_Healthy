using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public interface IMomoService
{
    Task<MomoQuickPayResponse> CreatePaymentAsync(int orderId, decimal amount, string description, string extraData = "");
}

public class MomoService : IMomoService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MomoService> _logger;
    private readonly MomoSettings _settings;

    public MomoService(
        IHttpClientFactory httpClientFactory,
        IOptions<MomoSettings> options,
        ILogger<MomoService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _settings = options.Value;
        _logger = logger;
    }

    public async Task<MomoQuickPayResponse> CreatePaymentAsync(int orderId, decimal amount, string description, string extraData = "")
    {
        ValidateSettings();

        if (orderId <= 0)
            throw new ArgumentException("OrderId khong hop le.", nameof(orderId));

        if (amount <= 0)
            throw new ArgumentException("So tien thanh toan MoMo phai lon hon 0.", nameof(amount));

        // MoMo yêu cầu amount là số nguyên (VND)
        long amountVnd = (long)Math.Round(amount, 0);
        if (amountVnd <= 0)
            throw new ArgumentException("So tien thanh toan MoMo sau khi lam tron phai lon hon 0.", nameof(amount));

        // Tạo orderId + requestId cho MoMo
        string momoOrderId = $"{orderId}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        string requestId = $"{orderId}-{Guid.NewGuid():N}";

        var request = new MomoQuickPayRequest
        {
            partnerCode = _settings.PartnerCode,
            partnerName = "ITHealthy",
            storeId = "ITHealthy Store",
            requestId = requestId,
            orderId = momoOrderId,
            amount = amountVnd,
            orderInfo = description.Replace("#", ""),
            redirectUrl = _settings.RedirectUrl,
            ipnUrl = _settings.IpnUrl,
            lang = "vi",
            autoCapture = true,
            extraData = Convert.ToBase64String(Encoding.UTF8.GetBytes(extraData)),
            orderGroupId = "",
            paymentCode = "",
            requestType = "captureWallet"
        };

        // rawSignature phải đúng thứ tự ALPHABET theo yêu cầu của MoMo
        // Thứ tự: accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
        var rawSignature =
            $"accessKey={_settings.AccessKey}" +
            $"&amount={request.amount}" +
            $"&extraData={request.extraData}" +
            $"&ipnUrl={request.ipnUrl}" +
            $"&orderId={request.orderId}" +
            $"&orderInfo={request.orderInfo}" +
            $"&partnerCode={request.partnerCode}" +
            $"&redirectUrl={request.redirectUrl}" +
            $"&requestId={request.requestId}" +
            $"&requestType={request.requestType}";

        request.signature = GetSignature(rawSignature, _settings.SecretKey);

        var json = JsonSerializer.Serialize(request);
        var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

        var httpResponse = await _httpClient.PostAsync(_settings.CreateUrl, httpContent);
        var respContent = await httpResponse.Content.ReadAsStringAsync();

        if (!httpResponse.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "MoMo create payment HTTP failed. OrderId: {OrderId}, StatusCode: {StatusCode}, Response: {Response}",
                orderId,
                (int)httpResponse.StatusCode,
                respContent);

            throw new InvalidOperationException("Khong tao duoc giao dich MoMo.");
        }

        var momoResponse = JsonSerializer.Deserialize<MomoQuickPayResponse>(respContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (momoResponse == null)
        {
            throw new InvalidOperationException("Khong doc duoc phan hoi tu MoMo.");
        }

        if (momoResponse.resultCode != 0)
        {
            _logger.LogWarning(
                "MoMo create payment rejected. OrderId: {OrderId}, MomoOrderId: {MomoOrderId}, ResultCode: {ResultCode}, Message: {Message}",
                orderId,
                momoOrderId,
                momoResponse.resultCode,
                momoResponse.message);

            throw new InvalidOperationException($"MoMo tu choi tao thanh toan: {momoResponse.message}");
        }

        if (string.IsNullOrWhiteSpace(momoResponse.payUrl))
        {
            throw new InvalidOperationException("MoMo khong tra ve payUrl.");
        }

        _logger.LogInformation(
            "MoMo create payment succeeded. OrderId: {OrderId}, MomoOrderId: {MomoOrderId}, RequestId: {RequestId}",
            orderId,
            momoResponse.orderId,
            momoResponse.requestId);

        return momoResponse;
    }

    private void ValidateSettings()
    {
        if (string.IsNullOrWhiteSpace(_settings.PartnerCode) ||
            string.IsNullOrWhiteSpace(_settings.AccessKey) ||
            string.IsNullOrWhiteSpace(_settings.SecretKey) ||
            string.IsNullOrWhiteSpace(_settings.CreateUrl) ||
            string.IsNullOrWhiteSpace(_settings.RedirectUrl) ||
            string.IsNullOrWhiteSpace(_settings.IpnUrl))
        {
            throw new InvalidOperationException("Cau hinh MoMo chua day du.");
        }
    }

    private static string GetSignature(string text, string key)
    {
        byte[] textBytes = Encoding.UTF8.GetBytes(text);
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);


        using var hmac = new HMACSHA256(keyBytes);
        byte[] hashBytes = hmac.ComputeHash(textBytes);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }
}
