using ITHealthy.Models;

namespace ITHealthy.Services
{
    public interface UserTokenService
    {
        string CreateAccessTokenUser(Customer customer, IList<string> roles);
        RefreshToken CreateRefreshToken(string ipAddress);

    }
}
