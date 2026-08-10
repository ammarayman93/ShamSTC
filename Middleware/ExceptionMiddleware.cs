using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ISPSystem.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var env = context.RequestServices.GetRequiredService<IWebHostEnvironment>();

                var response = new
                {
                    message = "ÕœÀ Œÿ√ œ«Œ·Ì ›Ì «·‰Ÿ«„",
                    details = env.IsDevelopment() ? ex.Message : null
                };

                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(response)
                );
            }
        }
    }
}