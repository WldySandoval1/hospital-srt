import { mapRequestToMedicalDevice, MED_DEVICE_REQUEST_SCHEMA, MedDeviceRequest } from "@core/dto";
import { DevicePhotoRepository, DeviceRepository } from "@core/repository";
import { MedicalDevice } from "@core/domain";
import { Helper } from "./helper";

export class MedicalDeviceService {
  constructor(
    private repository: DeviceRepository,
    private photoRepository: DevicePhotoRepository
  ) {}
  
  async checkinMedicalDevice(request: MedDeviceRequest): Promise<MedicalDevice> {
    MED_DEVICE_REQUEST_SCHEMA.parse(request)

    const deviceId = Helper.generateDeviceId()

    const photoURL = await this.photoRepository.savePhoto(request.photo, deviceId)

    const device = mapRequestToMedicalDevice(request, deviceId, photoURL)

    device.checkinAt = new Date()

    return await this.repository.checkinMedicalDevice(device)
  }
}
