import { Container } from "inversify";
import { retailModule } from "@/modules/retail/retail.container";
import { retailGeneratedModules } from "@/modules/retail/retail-generated.container";
import { authModule } from "@/modules/auth/auth.container";

const container = new Container();
container.load(authModule, retailModule, ...retailGeneratedModules);

export { container };
