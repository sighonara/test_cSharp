using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using test_cSharp.Controllers;
using test_cSharp.Models;
using test_cSharp.Services;

namespace test_cSharp.Tests.Controllers;

public class PlantsControllerTests {
    private readonly Mock<PlantService> _mockPlantService;
    private readonly Mock<ILogger<PlantsController>> _mockLogger;
    private readonly PlantsController _controller;

    public PlantsControllerTests() {
        var mockServiceLogger = new Mock<ILogger<PlantService>>();
        _mockPlantService = new Mock<PlantService>(mockServiceLogger.Object);
        _mockLogger = new Mock<ILogger<PlantsController>>();
        _controller = new PlantsController(_mockPlantService.Object, _mockLogger.Object);
    }

    [Fact]
    public void Get_ReturnsAllPlants() {
        // Arrange
        var plants = new List<Plant> {
            new Plant { Name = "Rose", ScientificName = "Rosa", Habitat = "Garden", SomethingInteresting = "Beautiful" },
            new Plant { Name = "Tulip", ScientificName = "Tulipa", Habitat = "Field", SomethingInteresting = "Colorful" }
        };
        _mockPlantService.Setup(s => s.Plants).Returns(plants);

        // Act
        var result = _controller.Get();

        // Assert
        Assert.Equal(2, result.Count());
        Assert.Contains(result, p => p.Name == "Rose");
        Assert.Contains(result, p => p.Name == "Tulip");
    }

    [Fact]
    public void GetByName_ExistingPlant_ReturnsPlant() {
        // Arrange
        var plant = new Plant {
            Name = "Rose",
            ScientificName = "Rosa",
            Habitat = "Garden",
            SomethingInteresting = "Beautiful"
        };
        _mockPlantService.Setup(s => s.GetPlant("Rose")).Returns(plant);

        // Act
        var result = _controller.Get("Rose");

        // Assert
        var okResult = Assert.IsType<ActionResult<Plant>>(result);
        Assert.Equal(plant, okResult.Value);
    }

    [Fact]
    public void GetByName_NonExistingPlant_ReturnsNotFound() {
        // Arrange
        _mockPlantService.Setup(s => s.GetPlant("NonExistent")).Returns((Plant?)null);

        // Act
        var result = _controller.Get("NonExistent");

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void Post_ValidPlant_ReturnsCreatedAtAction() {
        // Arrange
        var newPlant = new Plant {
            Name = "Daisy",
            ScientificName = "Bellis perennis",
            Habitat = "Meadow",
            SomethingInteresting = "Symbol of innocence"
        };
        _mockPlantService.Setup(s => s.CreatePlant(newPlant));

        // Act
        var result = _controller.Post(newPlant);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(_controller.Get), createdResult.ActionName);
        Assert.Equal(newPlant, createdResult.Value);
        Assert.True(createdResult.RouteValues!.ContainsKey("name"));
        Assert.Equal("Daisy", createdResult.RouteValues["name"]);
    }

    [Fact]
    public void Post_DuplicatePlant_ReturnsConflict() {
        // Arrange
        var duplicatePlant = new Plant {
            Name = "Rose",
            ScientificName = "Rosa",
            Habitat = "Garden",
            SomethingInteresting = "Beautiful"
        };
        _mockPlantService.Setup(s => s.CreatePlant(duplicatePlant))
            .Throws(new InvalidOperationException("Plant already exists"));

        // Act
        var result = _controller.Post(duplicatePlant);

        // Assert
        var conflictResult = Assert.IsType<ConflictObjectResult>(result.Result);
        Assert.Equal("Plant already exists", conflictResult.Value);
    }

    [Fact]
    public void Put_ExistingPlant_ReturnsOk() {
        // Arrange
        var updatedPlant = new Plant {
            Name = "Rose",
            ScientificName = "Rosa updated",
            Habitat = "Garden updated",
            SomethingInteresting = "Even more beautiful"
        };
        _mockPlantService.Setup(s => s.UpdatePlant("Rose", updatedPlant));

        // Act
        var result = _controller.Put("Rose", updatedPlant);

        // Assert
        Assert.IsType<OkResult>(result);
        _mockPlantService.Verify(s => s.UpdatePlant("Rose", updatedPlant), Times.Once);
    }

    [Fact]
    public void Put_NonExistingPlant_ReturnsNotFound() {
        // Arrange
        var plant = new Plant {
            Name = "NonExistent",
            ScientificName = "Test",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };
        _mockPlantService.Setup(s => s.UpdatePlant("NonExistent", plant))
            .Throws(new KeyNotFoundException("Plant not found"));

        // Act
        var result = _controller.Put("NonExistent", plant);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Plant not found", notFoundResult.Value);
    }

    [Fact]
    public void Put_RenameToExistingName_ReturnsConflict() {
        // Arrange
        var plant = new Plant {
            Name = "Tulip",
            ScientificName = "Test",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };
        _mockPlantService.Setup(s => s.UpdatePlant("Rose", plant))
            .Throws(new InvalidOperationException("Name already exists"));

        // Act
        var result = _controller.Put("Rose", plant);

        // Assert
        var conflictResult = Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal("Name already exists", conflictResult.Value);
    }

    [Fact]
    public void Delete_ExistingPlant_ReturnsNoContent() {
        // Arrange
        _mockPlantService.Setup(s => s.DeletePlant("Rose")).Returns(true);

        // Act
        var result = _controller.Delete("Rose");

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockPlantService.Verify(s => s.DeletePlant("Rose"), Times.Once);
    }

    [Fact]
    public void Delete_NonExistingPlant_ReturnsNotFound() {
        // Arrange
        _mockPlantService.Setup(s => s.DeletePlant("NonExistent")).Returns(false);

        // Act
        var result = _controller.Delete("NonExistent");

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("NonExistent", notFoundResult.Value?.ToString());
    }
}
