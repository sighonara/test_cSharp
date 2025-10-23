using Microsoft.AspNetCore.Mvc;
using test_cSharp.Models;
using test_cSharp.Services;

namespace test_cSharp.Controllers;

[ApiController]
[Route("[controller]")]
public class PlantsController(PlantService plantsService, ILogger<PlantsController> logger) : ControllerBase {

    [HttpGet(Name = "GetPlants")]
    public IEnumerable<Plant> Get() {
        Console.WriteLine("GetPlants: " + plantsService.Plants.Count());
        logger.LogInformation("GetPlants: " + plantsService.Plants.Count());
        return plantsService.Plants;
    }
    
    [HttpGet("{name}", Name = "GetPlant")]
    public ActionResult<Plant> Get(string name) {
        var plant = plantsService.GetPlant(name);
        if (plant == null) {
            return NotFound();
        }
        return plant;
    }

    [HttpPost(Name = "PostPlant")]
    public ActionResult<Plant> Post([FromBody] Plant plant) {
        try {
            plantsService.CreatePlant(plant);
            return CreatedAtAction(nameof(Get), new { name = plant.Name }, plant);
        } catch (InvalidOperationException ex) {
            return Conflict(ex.Message);
        }
    }

    [HttpPut("{name}", Name = "PutPlant")]
    public ActionResult Put(string name, [FromBody] Plant plant) {
        try {
            plantsService.UpdatePlant(name, plant);
            return Ok();
        } catch (KeyNotFoundException ex) {
            return NotFound(ex.Message);
        } catch (InvalidOperationException ex) {
            return Conflict(ex.Message);
        }
    }

    [HttpDelete("{name}", Name = "DeletePlant")]
    public ActionResult Delete(string name) {
        var wasDeleted = plantsService.DeletePlant(name);
        if (wasDeleted) {
            return NoContent();
        }
        return NotFound($"Plant '{name}' not found.");
    }
}
