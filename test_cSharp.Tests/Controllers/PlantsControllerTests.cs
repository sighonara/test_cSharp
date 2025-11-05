using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using test_cSharp.Controllers;
using test_cSharp.Models;
using test_cSharp.Services;

namespace test_cSharp.Tests.Controllers;

public class PlantsControllerTests {
    private readonly Mock<PlantService> _mockPlantService;
    private readonly PlantsController _controller;

    public PlantsControllerTests() {
        var mockServiceLogger = new Mock<ILogger<PlantService>>();
        _mockPlantService = new Mock<PlantService>(mockServiceLogger.Object);
        var mockLogger = new Mock<ILogger<PlantsController>>();
        _controller = new PlantsController(_mockPlantService.Object, mockLogger.Object);
    }

    [Fact]
    public void Get_ReturnsAllPlants() {
        var plants = new List<Plant> {
            new() { Name = "Rose", ScientificName = "Rosa", Habitat = "Garden", SomethingInteresting = "Beautiful" },
            new() { Name = "Tulip", ScientificName = "Tulipa", Habitat = "Field", SomethingInteresting = "Colorful" }
        };
        _mockPlantService.Setup(s => s.Plants).Returns(plants);

        var result = _controller.Get();

        Assert.Equal(2, result.Count());
        Assert.Contains(result, p => p.Name == "Rose");
        Assert.Contains(result, p => p.Name == "Tulip");
    }

    [Fact]
    public void GetByName_ExistingPlant_ReturnsPlant() {
        var plant = new Plant {
            Name = "Rose",
            ScientificName = "Rosa",
            Habitat = "Garden",
            SomethingInteresting = "Beautiful"
        };
        _mockPlantService.Setup(s => s.GetPlant("Rose")).Returns(plant);

        var result = _controller.Get("Rose");

        var okResult = Assert.IsType<ActionResult<Plant>>(result);
        Assert.Equal(plant, okResult.Value);
    }

    [Fact]
    public void GetByName_NonExistingPlant_ReturnsNotFound() {
        _mockPlantService.Setup(s => s.GetPlant("NonExistent")).Returns((Plant?)null);

        var result = _controller.Get("NonExistent");

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void Post_ValidPlant_ReturnsCreatedAtAction() {
        var newPlant = new Plant {
            Name = "Daisy",
            ScientificName = "Bellis perennis",
            Habitat = "Meadow",
            SomethingInteresting = "Symbol of innocence"
        };
        _mockPlantService.Setup(s => s.CreatePlant(newPlant));

        var result = _controller.Post(newPlant);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(_controller.Get), createdResult.ActionName);
        Assert.Equal(newPlant, createdResult.Value);
        Assert.True(createdResult.RouteValues!.ContainsKey("name"));
        Assert.Equal("Daisy", createdResult.RouteValues["name"]);
    }

    [Fact]
    public void Post_DuplicatePlant_ReturnsConflict() {
        var duplicatePlant = new Plant {
            Name = "Rose",
            ScientificName = "Rosa",
            Habitat = "Garden",
            SomethingInteresting = "Beautiful"
        };
        _mockPlantService.Setup(s => s.CreatePlant(duplicatePlant))
            .Throws(new InvalidOperationException("Plant already exists"));

        var result = _controller.Post(duplicatePlant);

        var conflictResult = Assert.IsType<ConflictObjectResult>(result.Result);
        Assert.Equal("Plant already exists", conflictResult.Value);
    }

    [Fact]
    public void Put_ExistingPlant_ReturnsOk() {
        var updatedPlant = new Plant {
            Name = "Rose",
            ScientificName = "Rosa updated",
            Habitat = "Garden updated",
            SomethingInteresting = "Even more beautiful"
        };
        _mockPlantService.Setup(s => s.UpdatePlant("Rose", updatedPlant));

        var result = _controller.Put("Rose", updatedPlant);

        Assert.IsType<OkResult>(result);
        _mockPlantService.Verify(s => s.UpdatePlant("Rose", updatedPlant), Times.Once);
    }

    [Fact]
    public void Put_NonExistingPlant_ReturnsNotFound() {
        var plant = new Plant {
            Name = "NonExistent",
            ScientificName = "Test",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };
        _mockPlantService.Setup(s => s.UpdatePlant("NonExistent", plant))
            .Throws(new KeyNotFoundException("Plant not found"));

        var result = _controller.Put("NonExistent", plant);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Plant not found", notFoundResult.Value);
    }

    [Fact]
    public void Put_RenameToExistingName_ReturnsConflict() {
        var plant = new Plant {
            Name = "Tulip",
            ScientificName = "Test",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };
        _mockPlantService.Setup(s => s.UpdatePlant("Rose", plant))
            .Throws(new InvalidOperationException("Name already exists"));

        var result = _controller.Put("Rose", plant);

        var conflictResult = Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal("Name already exists", conflictResult.Value);
    }

    [Fact]
    public void Delete_ExistingPlant_ReturnsNoContent() {
        _mockPlantService.Setup(s => s.DeletePlant("Rose")).Returns(true);

        var result = _controller.Delete("Rose");

        Assert.IsType<NoContentResult>(result);
        _mockPlantService.Verify(s => s.DeletePlant("Rose"), Times.Once);
    }

    [Fact]
    public void Delete_NonExistingPlant_ReturnsNotFound() {
        _mockPlantService.Setup(s => s.DeletePlant("NonExistent")).Returns(false);

        var result = _controller.Delete("NonExistent");

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("NonExistent", notFoundResult.Value?.ToString());
    }
}
