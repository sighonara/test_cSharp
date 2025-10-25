using test_cSharp.Services;

// TODO: (#10) Add structured logging with Serilog, or similar
// TODO: (#13) Add health check endpoints (/health, /ready) for Kubernetes/orchestrators
// TODO: (#11, #32) Add Application Insights or similar APM tool for monitoring
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<PlantService>();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Include XML comments in Swagger documentation
    var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    options.IncludeXmlComments(xmlPath);
});

// Add CORS Policy. Needed to allow Angular App to access the API.
// TODO: (#8) Configure environment-specific CORS policies (dev/staging/prod)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // Angular default port
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();
app.Services.GetRequiredService<PlantService>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // TODO: (#37) Enable HTTPS

// Use CORS (must be before UseAuthorization)
app.UseCors("AllowAngularApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
