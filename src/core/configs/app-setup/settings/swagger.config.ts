import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function swaggerSetup(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle("100gram API")
		.setDescription("api for 100gram")
		.addBearerAuth()
		.setVersion("1.0")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("/docs", app, documentFactory, {
		customSiteTitle: "100gram Swagger",
		yamlDocumentUrl: "/openapi.yaml"
	});
}
