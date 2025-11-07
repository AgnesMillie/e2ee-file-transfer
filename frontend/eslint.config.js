import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier'; // Importa a configuração que desliga regras conflitantes
import eslintPluginPrettier from 'eslint-plugin-prettier'; // Importa o plugin que roda o Prettier

export default [
  // Configurações globais
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Variáveis globais do navegador (window, document, etc.)
        ...globals.node, // Variáveis globais do Node (process, etc.)
      },
    },
    settings: {
      react: {
        version: 'detect', // Detecta automaticamente a versão do React
      },
    },
  },

  // Regras base do ESLint
  pluginJs.configs.recommended,

  // Regras do TypeScript
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic, // Regras de estilo do TypeScript

  // Regras do React (incluindo JSX runtime novo)
  { ...pluginReactConfig, rules: { ...pluginReactConfig.rules, 'react/react-in-jsx-scope': 'off' } },

  // Regras do React Hooks
  { files: ['src/**/*.{js,jsx,ts,tsx}'], plugins: { 'react-hooks': pluginReactHooks }, rules: pluginReactHooks.configs.recommended.rules },

  // Plugin do Prettier (Mostra erros de formatação)
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      ...eslintPluginPrettier.configs.recommended.rules,
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf', // Garante consistência de quebra de linha (LF)
          semi: true, // Exige ponto e vírgula
          singleQuote: true, // Usa aspas simples
          tabWidth: 2, // 2 espaços
          trailingComma: 'all', // Vírgula no final de objetos e arrays
        },
      ],
    },
  },

  // Configuração do Prettier (Desliga regras conflitantes)
  // DEVE SER O ÚLTIMO ITEM da array principal
  eslintConfigPrettier,
];