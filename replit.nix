{ pkgs }: {
	deps = [
		pkgs.toybox
  pkgs.busybox-sandbox-shell
  pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
	];
}