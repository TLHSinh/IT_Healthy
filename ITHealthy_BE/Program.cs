using ITHealthy.Data;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// ✅ Cấu hình CORS cho React localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins("http://localhost:3000") // 👈 đúng domain React dev
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // 👈 nếu có gửi cookie/token
    });
});

// 1️⃣ Đăng ký Controllers
builder.Services.AddControllers();

// 2️⃣ Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3️⃣ Email service
builder.Services.Configure<EmailSetting>(builder.Configuration.GetSection("EmailSetting"));
builder.Services.AddScoped<IEmailService, EmailService>();

// 4️⃣ Database connection
var connectionString = builder.Configuration.GetConnectionString("ITHealthyDBConnection");
builder.Services.AddDbContext<ITHealthyDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// 5️⃣ JWT Authentication
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
            //IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"])),
            ClockSkew = TimeSpan.Zero
        };
    });

// 6️⃣ Token services
builder.Services.AddScoped<UserTokenService, TokenService>();
builder.Services.AddScoped<AdminTokenService, TokenService>();

// ============================
// Đăng ký Cloudinary Service
// ============================
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
// builder.Services.AddSingleton<CloudinaryService>();
builder.Services.AddScoped<CloudinaryService>();

// 7️⃣ Xây dựng app
var app = builder.Build();

// ✅ Phải để trước Authentication
app.UseCors(MyAllowSpecificOrigins);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();