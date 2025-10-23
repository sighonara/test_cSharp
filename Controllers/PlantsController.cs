using Microsoft.AspNetCore.Mvc;
using test_cSharp.Models;
using test_cSharp.Services;

namespace test_cSharp.Controllers;

[ApiController]
[Route("[controller]")]
public class PlantsController(PlantService plantsService, ILogger<PlantsController> logger) : ControllerBase {
    private readonly ILogger<PlantsController> _logger = logger;

    [HttpGet(Name = "GetPlants")]
    public IEnumerable<Plant> Get() {
        Console.WriteLine("GetPlants: " + plantsService.Plants.Count);
        return plantsService.Plants;
    }
    
    [HttpPost(Name = "PostPlants")]
    public void Post([FromBody] Plant plant) {
        // Get current date/time
        // Create a new plant and set the updateTimestamp to the current date/time
        // Add the new plant to the database?
    }

    [HttpPut(Name = "PutPlants")]
    public void Put([FromBody] Plant plant) {
        // Get current date/time
        // Update the plant in the database with the new updateTimestamp
        // Update the other fields based on the new data
    }

    [HttpDelete(Name = "DeletePlants")]
    public void Delete([FromBody] Plant plant) {
        // Delete the plant from the in-memory database
        // Definitely want to log this one endpoint
    }
}
