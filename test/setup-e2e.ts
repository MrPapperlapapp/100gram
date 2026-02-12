import * as dotenv from "dotenv";
import * as path from "path";

// Всегда запускаем тесты в окружении test
process.env.NODE_ENV = process.env.NODE_ENV || "test";

// Подхватываем переменные из .env.test в корне репозитория
const envTestPath = path.resolve(__dirname, "../.env.test");
dotenv.config({ path: envTestPath });

// Обязательные переменные для тестовой БД
const databaseUrl = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
	console.error("\n❌ ОШИБКА: Тестовая база данных не настроена!\n");
	console.error(
		"📋 Для запуска e2e тестов создайте файл .env.test в корне и укажите:"
	);
	console.error('   DATABASE_URL="postgresql://user:pass@host:5432/dbname"');
	console.error("   DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME");
	console.error("\nПример смотрите в .env.test.example (если есть).\n");
	throw new Error("DATABASE_URL is not configured. Cannot run e2e tests.");
}

process.env.DATABASE_URL = databaseUrl;

// Для Prisma можно использовать DIRECT_URL, если он задан
const directUrl = process.env.DIRECT_URL || process.env.TEST_DIRECT_URL;
if (directUrl) {
	process.env.DIRECT_URL = directUrl;
}

console.log("✅ Тестовая БД настроена корректно");

// Увеличиваем таймаут для e2e
jest.setTimeout(30000);

console.log("🧪 E2E тесты готовы к запуску\n");
