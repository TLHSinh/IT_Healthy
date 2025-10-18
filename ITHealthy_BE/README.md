Các lệnh cần chạy để cài đặt các gói

dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.IdentityModel.Tokens
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package Swashbuckle.AspNetCore

Lệnh chạy dự án ASP.Net
dotnet build
dotnet run - hoặc - dotnet watch run

Một số lệnh Docker hữu ích

# Xây và chạy

docker compose up --build

# Dừng container

docker compose down

# Xóa toàn bộ container + volume DB (nếu cần reset DB)

docker compose down -v

# Xem log của backend

docker logs ithealthy_backend

#Hướng dẫn kết nối database với docker
