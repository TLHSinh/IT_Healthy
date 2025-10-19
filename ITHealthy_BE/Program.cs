using ITHealthy.Data;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;


var builder = WebApplication.CreateBuilder(args);


// 1️⃣ Đăng ký Controllers
builder.Services.AddControllers();

// 2️⃣ Cấu hình Swagger / OpenAPI (nếu cần test)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<EmailSetting>(builder.Configuration.GetSection("EmailSetting"));
builder.Services.AddScoped<IEmailService, EmailService>();




// 3️⃣ Kết nối Database
var connectionString = builder.Configuration.GetConnectionString("ITHealthyDBConnection");
builder.Services.AddDbContext<ITHealthyDbContext>(options =>
    options.UseSqlServer(connectionString)
);


// 4️⃣ Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),

            ClockSkew = TimeSpan.Zero // loại bỏ trễ mặc định 5 phút
        };
    });

// ============================
// 5️⃣ Đăng ký dịch vụ ứng dụng
// ============================
builder.Services.AddScoped<UserTokenService, TokenService>();
builder.Services.AddScoped<AdminTokenService, TokenService>();


// ============================
// 6️⃣ Xây dựng app
// ============================
var app = builder.Build();

// ============================
// 7️⃣ Cấu hình middleware
// ============================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();  //  phải đặt trước UseAuthorization()
app.UseAuthorization();

app.MapControllers();

app.Run();
