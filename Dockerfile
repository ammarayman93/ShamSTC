# ============================================================================
# Dockerfile - ISPSystem API (Multi-stage)
# ============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Build & Publish
# ---------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# نسخ ملف المشروع واستعادة الحزم
COPY ISPSystem.csproj .
RUN dotnet restore "ISPSystem.csproj" --disable-parallel --no-cache

# نسخ جميع الملفات وبناء المشروع
COPY . .
RUN dotnet publish "ISPSystem.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------------------------------------------------------------------------
# Stage 2: Runtime
# ---------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# مطلوب لنسخ/استعادة قواعد البيانات
RUN apt-get update \
    && apt-get install -y --no-install-recommends default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# متغيرات البيئة
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true
ENV ASPNETCORE_HTTP_PORTS="5000"
ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 5000

# نسخ الملفات المبنية
COPY --from=build /app/publish .

# نقطة الدخول
ENTRYPOINT ["dotnet", "ISPSystem.dll"]
