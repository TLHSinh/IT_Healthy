// using Newtonsoft.Json.Linq;

// public class LocationService
// {
//     private static readonly HttpClient client = new HttpClient();

//     public static async Task<(double? lat, double? lng)?> GetLatLngAsync(string fullAddress)
//     {
//         try
//         {
//             var query = Uri.EscapeDataString($"{fullAddress}, Việt Nam");
//             var url = $"https://api.haochuan.io/geocode/vn?q={query}";

//             var response = await client.GetStringAsync(url);
//             var json = JArray.Parse(response);

//             if (json.Count > 0)
//             {
//                 var first = json[0];
//                 double lat = first["lat"].Value<double>();
//                 double lng = first["lng"].Value<double>();
//                 return (lat, lng);
//             }
//             return null;
//         }
//         catch (Exception ex)
//         {
//             // Log nếu cần
//             Console.WriteLine($"Lỗi geocoding: {ex.Message}");
//             return null;
//         }
//     }
// }


using Newtonsoft.Json.Linq;

public class GeocodingService
{
    private static readonly HttpClient _client = new HttpClient
    {
        Timeout = TimeSpan.FromSeconds(10)
    };

    public static async Task<(double? lat, double? lng)?> GetCoordinatesAsync(string address)
    {
        try
        {
            var query = Uri.EscapeDataString($"{address}, Việt Nam");
            var url = $"https://api.haochuan.io/geocode/vn?q={query}";

            var json = await _client.GetStringAsync(url);
            var results = JArray.Parse(json);

            if (results.Count > 0)
            {
                var first = results[0];
                double lat = first["lat"]?.Value<double>() ?? 0;
                double lng = first["lng"]?.Value<double>() ?? 0;

                if (lat != 0 && lng != 0)
                    return (lat, lng);
            }

            // Dự phòng: nếu haochaun lỗi → dùng Nominatim (OSM - miễn phí hoàn toàn)
            return await GetFromNominatimAsync(address);
        }
        catch (Exception ex)
        {
            // Log nếu cần: _logger.LogWarning(ex, "Geocoding failed");
            Console.WriteLine($"Geocoding error: {ex.Message}");
            return await GetFromNominatimAsync(address);
        }
    }

    // Dự phòng siêu ổn định (không giới hạn)
    private static async Task<(double? lat, double? lng)?> GetFromNominatimAsync(string address)
    {
        try
        {
            var query = Uri.EscapeDataString(address + ", Việt Nam");
            var url = $"https://nominatim.openstreetmap.org/search?format=json&q={query}&countrycodes=vn&limit=1";

            _client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (YourAppName/1.0)");

            var json = await _client.GetStringAsync(url);
            var results = JArray.Parse(json);

            if (results.Count > 0)
            {
                var loc = results[0];
                double lat = loc["lat"]?.Value<double>() ?? 0;
                double lon = loc["lon"]?.Value<double>() ?? 0;
                return (lat, lon);
            }
        }
        catch { /* ignore */ }

        return null;
    }
}