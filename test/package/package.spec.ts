import { getPackageJson } from "../../src/utils/package";

describe("Package", () => {
    it("should have a name", () => {
        const packageJson = getPackageJson("./test/package");
        expect(packageJson.name).toBe("@primno/test-name");
    });

    it("should have a dependency", () => {
        const packageJson = getPackageJson("./test/package");
        expect(packageJson.dependencies).toHaveProperty("@primno/test-dependencies");
        expect(packageJson.dependencies["@primno/test-dependencies"]).toBe("1.2.3");
    });

    it("should have a dev dependency", () => {
        const packageJson = getPackageJson("./test/package");
        expect(packageJson.devDependencies).toHaveProperty("@primno/test-dev-dependencies");
        expect(packageJson.devDependencies["@primno/test-dev-dependencies"]).toBe("1.2.3");
    });

    it("should have a peer dependency", () => {
        const packageJson = getPackageJson("./test/package");
        expect(packageJson.peerDependencies).toHaveProperty("@primno/test-peer-dependencies");
        expect(packageJson.peerDependencies["@primno/test-peer-dependencies"]).toBe("1.2.3");
    });
});