using Microsoft.AspNetCore.Mvc;
using test_cSharp.Models;
using test_cSharp.Services;

namespace test_cSharp.Controllers;

// FUTURE: Add authentication/authorization with JWT tokens or cookie-based auth
// FUTURE: Implement rate limiting to prevent API abuse
// FUTURE: Add pagination support for GET /plants endpoint
// FUTURE: Add API versioning (e.g., /v1/plants) for backward compatibility
[ApiController]
[Route("[controller]")]
public class PlantsController(PlantService plantsService, ILogger<PlantsController> logger) : ControllerBase {

    /// <summary>
    /// Retrieves all plants from the collection. No logging on this endpoint because it's only read-only and
    /// because I know the front-end pings this endpoint every 10 seconds, which makes chatty logs.
    /// </summary>
    /// <returns>List of all plants</returns>
    [HttpGet(Name = "GetPlants")]
    public IEnumerable<Plant> Get() {
        return plantsService.Plants;
    }
    
    /// <summary>
    /// Retrieves a specific plant by name (case-insensitive)
    /// </summary>
    /// <param name="name">The name of the plant to retrieve</param>
    /// <returns>The requested plant or 404 if not found</returns>
    [HttpGet("{name}", Name = "GetPlant")]
    public ActionResult<Plant> Get(string name) {
        var plant = plantsService.GetPlant(name);
        if (plant == null) {
            return NotFound();
        }
        return plant;
    }

    /// <summary>
    /// Creates a new plant
    /// </summary>
    /// <param name="plant">The plant object to create</param>
    /// <returns>201 Created with the new plant, or 409 Conflict if name already exists</returns>
    // FUTURE: Add input validation/sanitization for XSS prevention
    [HttpPost(Name = "PostPlant")]
    public ActionResult<Plant> Post([FromBody] Plant plant) {
        try {
            plantsService.CreatePlant(plant);
            logger.LogInformation("Plant '{PlantName}' created", plant.Name);
            return CreatedAtAction(nameof(Get), new { name = plant.Name }, plant);
        } catch (InvalidOperationException ex) {
            return Conflict(ex.Message);
        }
    }

    /// <summary>
    /// Updates an existing plant (allows renaming if new name doesn't conflict)
    /// </summary>
    /// <param name="name">The current name of the plant to update</param>
    /// <param name="plant">The updated plant object</param>
    /// <returns>200 OK on success, 404 if plant not found, or 409 if new name conflicts</returns>
    [HttpPut("{name}", Name = "PutPlant")]
    public ActionResult Put(string name, [FromBody] Plant plant) {
        try {
            plantsService.UpdatePlant(name, plant);
            logger.LogInformation("Plant '{PlantName}' updated", name);
            return Ok();
        } catch (KeyNotFoundException ex) {
            return NotFound(ex.Message);
        } catch (InvalidOperationException ex) {
            return Conflict(ex.Message);
        }
    }

    /// <summary>
    /// Deletes a plant by name (case-insensitive)
    /// </summary>
    /// <param name="name">The name of the plant to delete</param>
    /// <returns>204 No Content on success, or 404 if plant not found</returns>
    [HttpDelete("{name}", Name = "DeletePlant")]
    public ActionResult Delete(string name) {
        var wasDeleted = plantsService.DeletePlant(name);
        if (wasDeleted) {
            logger.LogInformation("Plant '{PlantName}' deleted", name);
            return NoContent();
        }
        return NotFound($"Plant '{name}' not found.");
    }
}
