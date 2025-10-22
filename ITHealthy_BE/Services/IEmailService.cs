using ITHealthy.Models;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace ITHealthy.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSetting _settings;
        public EmailService(IOptions<EmailSetting> options)
        {
            _settings = options.Value;


            if (string.IsNullOrEmpty(_settings.SenderEmail))
                throw new Exception("⚠️ SenderEmail chưa được cấu hình trong appsettings.json");
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_settings.SenderEmail, _settings.SenderName);
            message.To.Add(toEmail);
            message.Subject = subject;
            message.Body = body;

            using var smtp = new SmtpClient(_settings.SmtpServer, _settings.Port)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                EnableSsl = _settings.EnableSsl
            };

            await smtp.SendMailAsync(message);
        }
    }
}
