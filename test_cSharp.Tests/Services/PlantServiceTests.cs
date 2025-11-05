using Microsoft.Extensions.Logging;
using Moq;
using test_cSharp.Models;
using test_cSharp.Services;

namespace test_cSharp.Tests.Services;

// Test class but don't load from or save to a file
public class TestPlantService : PlantService {
    public TestPlantService(ILogger<PlantService> logger) : base(logger) { }

    protected override void LoadPlants() {
        // Don't load from file during tests - start with an empty collection
    }

    protected override void SavePlants() {
        // Don't save to file during tests
    }
}

public class PlantServiceTests {
    private PlantService CreateService() {
        var mockLogger = new Mock<ILogger<PlantService>>();
        return new TestPlantService(mockLogger.Object);
    }

    [Fact]
    public void Constructor_InitializesEmptyCollection_Successfully() {
        var service = CreateService();

        Assert.Empty(service.Plants);
    }

    [Fact]
    public void GetPlant_ExistingPlant_ReturnsPlant() {
        var service = CreateService();
        var testPlant = new Plant {
            Name = "Test Rose",
            ScientificName = "Rosa testus",
            Habitat = "Garden",
            SomethingInteresting = "Test flower"
        };
        service.CreatePlant(testPlant);

        var result = service.GetPlant("Test Rose");

        Assert.NotNull(result);
        Assert.Equal("Test Rose", result.Name);
    }

    [Fact]
    public void GetPlant_NonExistingPlant_ReturnsNull() {
        var service = CreateService();

        var result = service.GetPlant("NonExistentPlant12345");

        Assert.Null(result);
    }

    [Fact]
    public void GetPlant_CaseInsensitive_ReturnsPlant() {
        var service = CreateService();
        var testPlant = new Plant {
            Name = "Tulip",
            ScientificName = "Tulipa",
            Habitat = "Garden",
            SomethingInteresting = "Colorful"
        };
        service.CreatePlant(testPlant);

        var result = service.GetPlant("TULIP");

        Assert.NotNull(result);
        Assert.Equal("Tulip", result.Name);
    }

    [Fact]
    public void CreatePlant_NewPlant_AddsSuccessfully() {
        var service = CreateService();
        var newPlant = new Plant {
            Name = "Test Plant Unique 12345",
            ScientificName = "Testus plantus",
            Habitat = "Test habitat",
            SomethingInteresting = "Test fact"
        };
        var initialCount = service.Plants.Count();

        service.CreatePlant(newPlant);

        Assert.Equal(initialCount + 1, service.Plants.Count());
        var addedPlant = service.GetPlant(newPlant.Name);
        Assert.NotNull(addedPlant);
        Assert.Equal(newPlant.ScientificName, addedPlant.ScientificName);
    }

    [Fact]
    public void CreatePlant_DuplicateName_ThrowsInvalidOperationException() {
        var service = CreateService();
        var firstPlant = new Plant {
            Name = "Daisy",
            ScientificName = "Bellis perennis",
            Habitat = "Meadow",
            SomethingInteresting = "Cheerful"
        };
        service.CreatePlant(firstPlant);

        var duplicatePlant = new Plant {
            Name = "Daisy",
            ScientificName = "Different name",
            Habitat = "Different habitat",
            SomethingInteresting = "Different fact"
        };

        var exception = Assert.Throws<InvalidOperationException>(() => service.CreatePlant(duplicatePlant));
        Assert.Contains("Daisy", exception.Message);
    }

    [Fact]
    public void CreatePlant_DuplicateName_CaseInsensitive_ThrowsException() {
        var service = CreateService();
        var firstPlant = new Plant {
            Name = "Sunflower",
            ScientificName = "Helianthus",
            Habitat = "Field",
            SomethingInteresting = "Tracks the sun"
        };
        service.CreatePlant(firstPlant);

        var duplicatePlant = new Plant {
            Name = "SUNFLOWER",
            ScientificName = "Different name",
            Habitat = "Different habitat",
            SomethingInteresting = "Different fact"
        };

        Assert.Throws<InvalidOperationException>(() => service.CreatePlant(duplicatePlant));
    }

    [Fact]
    public void UpdatePlant_ExistingPlant_UpdatesSuccessfully() {
        var service = CreateService();
        var originalPlant = new Plant {
            Name = "Orchid",
            ScientificName = "Orchidaceae",
            Habitat = "Tropical",
            SomethingInteresting = "Exotic"
        };
        service.CreatePlant(originalPlant);

        var updatedPlant = new Plant {
            Name = "Orchid",
            ScientificName = "Updated scientific name",
            Habitat = "Updated habitat",
            SomethingInteresting = "Updated fact"
        };

        service.UpdatePlant("Orchid", updatedPlant);

        var result = service.GetPlant("Orchid");
        Assert.NotNull(result);
        Assert.Equal("Updated scientific name", result.ScientificName);
        Assert.Equal("Updated habitat", result.Habitat);
    }

    [Fact]
    public void UpdatePlant_NonExistingPlant_ThrowsKeyNotFoundException() {
        var service = CreateService();
        var nonExistingPlant = new Plant {
            Name = "Non Existing Plant 12345",
            ScientificName = "Test",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };

        Assert.Throws<KeyNotFoundException>(() =>
            service.UpdatePlant("Non Existing Plant 12345", nonExistingPlant));
    }

    [Fact]
    public void UpdatePlant_RenameToExistingName_ThrowsInvalidOperationException() {
        var service = CreateService();
        var firstPlant = new Plant {
            Name = "Lily",
            ScientificName = "Lilium",
            Habitat = "Garden",
            SomethingInteresting = "Elegant"
        };
        var secondPlant = new Plant {
            Name = "Iris",
            ScientificName = "Iridaceae",
            Habitat = "Wetland",
            SomethingInteresting = "Colorful petals"
        };
        service.CreatePlant(firstPlant);
        service.CreatePlant(secondPlant);

        var updatedPlant = new Plant {
            Name = "Iris", // Trying to rename Lily to Iris
            ScientificName = firstPlant.ScientificName,
            Habitat = firstPlant.Habitat,
            SomethingInteresting = firstPlant.SomethingInteresting
        };

        var exception = Assert.Throws<InvalidOperationException>(() =>
            service.UpdatePlant("Lily", updatedPlant));
        Assert.Contains("Iris", exception.Message);
    }

    [Fact]
    public void UpdatePlant_Rename_UpdatesSuccessfully() {
        var service = CreateService();
        var testPlant = new Plant {
            Name = "Rename Test Plant Original",
            ScientificName = "Testus renamus",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };
        service.CreatePlant(testPlant);

        var renamedPlant = new Plant {
            Name = "Rename Test Plant New",
            ScientificName = testPlant.ScientificName,
            Habitat = testPlant.Habitat,
            SomethingInteresting = testPlant.SomethingInteresting
        };

        service.UpdatePlant("Rename Test Plant Original", renamedPlant);

        Assert.Null(service.GetPlant("Rename Test Plant Original"));
        var result = service.GetPlant("Rename Test Plant New");
        Assert.NotNull(result);
        Assert.Equal("Testus renamus", result.ScientificName);
    }

    [Fact]
    public void DeletePlant_ExistingPlant_ReturnsTrue() {
        var service = CreateService();
        var testPlant = new Plant {
            Name = "Delete Test Plant",
            ScientificName = "Testus deleteus",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };
        service.CreatePlant(testPlant);
        var countBefore = service.Plants.Count();

        var result = service.DeletePlant("Delete Test Plant");

        Assert.True(result);
        Assert.Equal(countBefore - 1, service.Plants.Count());
        Assert.Null(service.GetPlant("Delete Test Plant"));
    }

    [Fact]
    public void DeletePlant_NonExistingPlant_ReturnsFalse() {
        var service = CreateService();

        var result = service.DeletePlant("Non Existing Plant 12345");

        Assert.False(result);
    }

    [Fact]
    public void DeletePlant_CaseInsensitive_DeletesSuccessfully() {
        var service = CreateService();
        var testPlant = new Plant {
            Name = "CaseSensitive Delete Test",
            ScientificName = "Testus caseus",
            Habitat = "Test",
            SomethingInteresting = "Test"
        };
        service.CreatePlant(testPlant);

        var result = service.DeletePlant("casesensitive delete test");

        Assert.True(result);
        Assert.Null(service.GetPlant("CaseSensitive Delete Test"));
    }
}
