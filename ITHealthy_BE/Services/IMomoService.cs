using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

public interface IMomoService
{
    Task<MomoQuickPayResponse> CreatePaymentAsync(int orderId, decimal amount, string description, string extraData = "");
}

public class MomoService : IMomoService
{
    private readonly HttpClient _httpClient;
    private readonly MomoSettings _settings;

    public MomoService(IHttpClientFactory httpClientFactory, IOptions<MomoSettings> options)
    {
        _httpClient = httpClientFactory.CreateClient();
        _settings = options.Value;
    }

    public async Task<MomoQuickPayResponse> CreatePaymentAsync(int orderId, decimal amount, string description, string extraData = "")
    {
        // MoMo yêu cầu amount là số nguyên (VND)
        long amountVnd = (long)Math.Round(amount, 0);

        // Tạo orderId + requestId cho MoMo
        string momoOrderId = orderId + "-" + DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        string requestId = Guid.NewGuid().ToString();

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

        Console.WriteLine("=====================================");
        Console.WriteLine(rawSignature);
        Console.WriteLine("=====================================");

        var json = JsonSerializer.Serialize(request);
        var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

        var httpResponse = await _httpClient.PostAsync(_settings.CreateUrl, httpContent);
        var respContent = await httpResponse.Content.ReadAsStringAsync();

        if (!httpResponse.IsSuccessStatusCode)
        {
            throw new Exception($"MoMo create payment failed: {respContent}");
        }

        var momoResponse = JsonSerializer.Deserialize<MomoQuickPayResponse>(respContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (momoResponse == null)
        {
            throw new Exception("Cannot deserialize MoMo response.");
        }

        return momoResponse;
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
