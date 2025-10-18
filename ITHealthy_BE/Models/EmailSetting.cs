namespace ITHealthy.Models
{
    public class EmailSetting
    {
        public string SmtpServer { get; set; }      // Địa chỉ máy chủ SMTP (VD: smtp.gmail.com)
        public int Port { get; set; }               // Cổng (VD: 587)
        public bool EnableSsl { get; set; }         // Có dùng SSL/TLS không
        public string SenderName { get; set; }      // Tên người gửi hiển thị
        public string SenderEmail { get; set; }     // Địa chỉ email người gửi
        public string Username { get; set; }        // Tài khoản đăng nhập SMTP
        public string Password { get; set; }        // Mật khẩu hoặc App Password
    }
}
