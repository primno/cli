import { convertToSnakeCase } from "../src/utils/naming";

describe('Naming', () => {
    describe('CamelCase to SnakeCase', () => {
        it('should convert camelCase to snake_case', () => {
            expect(convertToSnakeCase('camelCaseString')).toBe('camel_case_string');
        });
    });

    describe('PascalCase to SnakeCase', () => {
        it('should convert PascalCase to snake_case', () => {
            expect(convertToSnakeCase('PascalCaseString')).toBe('pascal_case_string');
        });
    });

    describe('SnakeCase to SnakeCase', () => {
        it('should convert snake_case to snake_case', () => {
            expect(convertToSnakeCase('snake_case_string')).toBe('snake_case_string');
        });
    });

    describe('KebabCase to SnakeCase', () => {
        it('should convert kebab-case to snake_case', () => {
            expect(convertToSnakeCase('kebab-case-string')).toBe('kebab_case_string');
        });
    });

    describe('SpaceCase to SnakeCase', () => {
        it('should convert space case to snake_case', () => {
            expect(convertToSnakeCase('space Case string')).toBe('space_case_string');
        });
    });
});