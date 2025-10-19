using ITHealthy.Models;

namespace ITHealthy.Services
{
    public interface AdminTokenService
    {
        string CreateAccessTokenAdmin(Staff staff, IList<string> roles);
        RefreshToken CreateRefreshToken(string ipAddress);

    }
}
