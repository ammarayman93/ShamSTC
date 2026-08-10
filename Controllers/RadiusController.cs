using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using ISPSystem.Services;
using ISPSystem.Models;
using ISPSystem.DTOs;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RadiusController : ControllerBase
    {
        private readonly RadiusClientService _radiusClient;
        private readonly RadiusServerConfig _config;
        private readonly ILogger<RadiusController> _logger;

        public RadiusController(
            RadiusClientService radiusClient,
            IOptions<RadiusServerConfig> config,
            ILogger<RadiusController> logger)
        {
            _radiusClient = radiusClient;
            _config = config.Value;
            _logger = logger;
        }

        [HttpPost("authenticate")]
        [AllowAnonymous]
        public async Task<IActionResult> Authenticate([FromBody] RadiusAuthenticateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            try
            {
                var response = await _radiusClient.AuthenticateAsync(
                    dto.Username,
                    dto.Password,
                    dto.NasIp,
                    dto.MacAddress
                );

                return Ok(new
                {
                    success = response.Success,
                    code = response.Code,
                    message = response.Message,
                    attributes = response.Attributes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS authentication error");
                return StatusCode(500, new { message = "RADIUS server error", error = ex.Message });
            }
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var response = await _radiusClient.AuthenticateAsync("test", "test123");
                return Ok(new
                {
                    connected = true,
                    server = _config.Host,
                    port = _config.Port,
                    response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    connected = false,
                    error = ex.Message,
                    server = _config.Host,
                    port = _config.Port
                });
            }
        }
    }
}