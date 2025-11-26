{
  description = "Reezer development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
        config = {};
        overlays = [];
      };
    in
    {
      devShells.${system}.default = pkgs.mkShellNoCC {
        packages = with pkgs; [
          # Editors & tools
          neovim
          tmux

          # Frontend development
          nodejs_22
          pnpm

          # Backend development
          dotnetCorePackages.sdk_10_0-bin
          libwebp

          # DevOps & Infrastructure
          ansible
        ];

        shellHook = ''
          if [ -z "$TMUX" ]; then
            exec tmux
          fi
        '';
      };
    };
}
