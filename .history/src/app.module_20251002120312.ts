import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { ComputerEntity } from "./adapter/repository/supabase/computer.entity";
import { MedicalDeviceEntity } from "./adapter/repository/supabase/medical-device.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>("DATABASE_URL");
        console.log("DATABASE_URL:", dbUrl);
        return {
          type: "postgres",
          url: dbUrl,
          autoLoadEntities: true,
          synchronize: true,
          ssl: { rejectUnauthorized: false },
        };
      },
    }),
    TypeOrmModule.forFeature([ComputerEntity, MedicalDeviceEntity]),
  ],
})
export class AppModule {}
