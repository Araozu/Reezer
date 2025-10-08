.PHONY: clean build rebuild run

# Default configuration
CONFIG ?= Debug
FRAMEWORK ?= net10.0
VERBOSITY ?= minimal

clean:
	find Api Application Domain Infrastructure -type d \( -name "obj" -o -name "bin" \) -exec rm -rf {} +

build:
	dotnet build Reezer.sln --configuration $(CONFIG) --framework $(FRAMEWORK) --verbosity $(VERBOSITY) $(ARGS)

rebuild: clean build

run:
	cd Api && dotnet run --configuration $(CONFIG) --framework $(FRAMEWORK) $(ARGS)
