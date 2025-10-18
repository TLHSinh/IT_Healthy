using ITHealthy.Models;

namespace ITHealthy.Services
{
    public interface ITokenService
    {
        string CreateAccessToken(Customer customer, IList<string> roles);
        RefreshToken CreateRefreshToken(string ipAddress);

    }
}
