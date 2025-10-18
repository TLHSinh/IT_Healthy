namespace ITHealthy.DTOs
{
    public record RegisterDTO(string FullName, string Email, string Password, string Phone);

    public record LoginDTO(string Email, string Password);

    // Yêu cầu làm mới token
    public record TokenRequestDTO(string AccessToken, string RefreshToken);

    // Phản hồi trả token mới
    public record TokenResponsedDTO(string AccessToken, string RefreshToken);
    public record AssignRoleDTO(string Email, string RoleName);
}
