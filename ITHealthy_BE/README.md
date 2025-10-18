CÀI ĐẶT VÀ CHẠY DỰ ÁN IT_HEALTHY

1.  CÀI ĐẶT CÁC GÓI NUGET CẦN THIẾT CHO BACKEND (ASP.NET CORE)

Tại thư mục ITHealthy_BE, mở Terminal (hoặc PowerShell) và chạy lần lượt các lệnh sau:

dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.IdentityModel.Tokens
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package Swashbuckle.AspNetCore

2.  BUILD VÀ CHẠY BACKEND

Sau khi cài đặt đầy đủ các package, chạy dự án bằng cách:

# B1 Build project

dotnet build

# B2 Chạy project (cách 1)

dotnet run

# Hoặc, chạy ở chế độ tự reload khi thay đổi code (cách 2)

dotnet watch run

3.  CÁC LỆNH DOCKER

# Xây và khởi động toàn bộ hệ thống (BE + FE + DB)

docker compose up --build

# Dừng tất cả container

docker compose down

# Xóa toàn bộ container và volume (dùng khi muốn reset database)

docker compose down -v

# Xem log của backend

docker logs ithealthy_backend
