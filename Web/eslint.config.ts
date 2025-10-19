import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	{
		rules: {
			"indent": ["error", "tab"],
			"brace-style": ["error", "allman"],
			"no-tabs": "off",
			"quotes": ["error", "double"],
			"semi": ["error", "always"],
			"semi-spacing": ["error", { "before": false, "after": true }],
			"no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],
			// migrated
			"no-const-assign": "error",
			"no-var": "error",
			"array-callback-return": "error",
			"prefer-template": "error",
			"template-curly-spacing": "error",
			"no-useless-escape": "error",
			"wrap-iife": "error",
			"no-loop-func": "error",
			"default-param-last": "error",
			"space-before-function-paren": ["error", "never"],
			"space-before-blocks": "error",
			"no-param-reassign": "error",
			"function-paren-newline": "error",
			"comma-dangle": ["error", "always-multiline"],
			"arrow-spacing": "error",
			"arrow-parens": "error",
			"arrow-body-style": "error",
			"no-confusing-arrow": "error",
			"implicit-arrow-linebreak": "error",
			"no-duplicate-imports": "error",
			"object-curly-newline": "error",
			"dot-notation": "error",
			"one-var": ["error", "never"],
			"no-multi-assign": "error",
			"no-plusplus": "error",
			"operator-linebreak": "error",
			"eqeqeq": "error",
			"no-case-declarations": "error",
			"no-nested-ternary": "error",
			"no-unneeded-ternary": "error",
			"no-mixed-operators": "error",
			"nonblock-statement-body-position": "error",
			"keyword-spacing": "error",
			"space-infix-ops": "error",
			"eol-last": "error",
			"newline-per-chained-call": "error",
			"no-whitespace-before-property": "error",
			"space-in-parens": "error",
			"array-bracket-spacing": "error",
			"key-spacing": "error",
			"no-trailing-spaces": "error",
			"comma-style": "error",
			"radix": "error",
			"no-new-wrappers": "error",
		},
	},
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": "off",
		},
	},
	{
		files: [
			"**/*.svelte",
			"**/*.svelte.ts",
			"**/*.svelte.js",
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: [".svelte"],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
	{
		rules: {
			"svelte/no-navigation-without-resolve": "off",
		},
	},
);
