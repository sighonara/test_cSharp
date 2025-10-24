using System.Text.Json;
using test_cSharp.Models;

namespace test_cSharp.Services;

// FUTURE: Replace in-memory JSON storage with database (SQL Server, PostgreSQL, or NoSQL like MongoDB)
// FUTURE: Implement optimistic concurrency control with ETags or row versioning
// Far FUTURE: Add caching layer (Redis/IMemoryCache) for frequently accessed plant data
public class PlantService {
    private readonly ILogger<PlantService> _logger;
    private const string FilePath = "plants.json";
    private Dictionary<string, Plant> _plants { get; set; }
    public IEnumerable<Plant> Plants => _plants.Values;
    private readonly JsonSerializerOptions _options = new() { WriteIndented = true };

    public PlantService(ILogger<PlantService> logger) {
        _logger = logger;
        _plants = new Dictionary<string, Plant>(StringComparer.OrdinalIgnoreCase);
        LoadPlants();
    }

    private void LoadPlants() {
        try {
            if (!File.Exists(FilePath)) {
                throw new FileNotFoundException("File not found");
            }

            var json = File.ReadAllText(FilePath);
            var plantList = JsonSerializer.Deserialize<List<Plant>>(json) ?? throw new Exception("Failed to deserialize");
            
            _plants.Clear();
            
            foreach (var plant in plantList) {
                if (_plants.ContainsKey(plant.Name)) {
                    _logger.LogWarning("Duplicate plant name '{PlantName}' found during load. Skipping.", plant.Name);
                    continue;
                }
                
                _plants[plant.Name] = plant;
            }
            
            Console.WriteLine("Loaded " + _plants.Count + " plants");
        } catch (Exception e)
        {
            Console.WriteLine(e);
            _logger.LogError(e.Message);
            Environment.Exit(1);
        }
    }

    private void SavePlants() {
        var plantList = _plants.Values.ToList();
        var json = JsonSerializer.Serialize(plantList, _options);
        File.WriteAllText(FilePath, json);
    }

    public Plant? GetPlant(string name) {
        return _plants.GetValueOrDefault(name);
    }
    
    public void CreatePlant(Plant plant) {
        if (_plants.ContainsKey(plant.Name)) {
            throw new InvalidOperationException($"Plant with name '{plant.Name}' already exists.");
        }
        
        _plants[plant.Name] = plant;
        SavePlants();
    }
    
    public void UpdatePlant(string originalName, Plant plant) {
        if (!_plants.ContainsKey(originalName)) {
            throw new KeyNotFoundException($"Plant '{originalName}' not found.");
        }
        
        // If the name is changing, check for duplicates
        if (originalName != plant.Name && _plants.ContainsKey(plant.Name)) {
            throw new InvalidOperationException($"Plant with name '{plant.Name}' already exists.");
        }
        
        // Remove old entry if name changed
        if (originalName != plant.Name) {
            _plants.Remove(originalName);
        }
        
        plant.Updated = DateTime.Now;
        _plants[plant.Name] = plant;
        SavePlants();
    }
    
    public bool DeletePlant(string name) {
        var wasDeleted = _plants.Remove(name);
        if (wasDeleted) {
            SavePlants();
        }
        return wasDeleted;
    }
}