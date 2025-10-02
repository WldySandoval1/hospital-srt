import { createClient } from "@supabase/supabase-js";
import {
  Computer,
  DeviceCriteria,
  DeviceId,
  EnteredDevice,
  FrequentComputer,
  MedicalDevice,
} from "@core/domain";
import { DeviceRepository } from "@core/repository";

/**
 * Esta clase es la encargada de hablar con Supabase para manejar
 * todo lo relacionado con los dispositivos: computadoras, dispositivos médicos,
 * y los computadores que entran seguido (frecuentes).
 * 
 * Básicamente, es como un puente entre nuestra aplicación y la base de datos en Supabase.
 */
export class SupabaseDeviceRepository implements DeviceRepository {
  private supabase;

  constructor() {
    // Aquí conectamos con Supabase usando las llaves y URL que tenemos en las variables de entorno.
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  // -------------------------------------------------------------------
  // Frequent Computers
  // -------------------------------------------------------------------

  async registerFrequentComputer(computer: FrequentComputer): Promise<FrequentComputer> {
    const { error } = await this.supabase
      .from("frequent_computers")
      .insert({
        id: computer.device.id,
        brand: computer.device.brand,
        model: computer.device.model,
        owner_id: computer.device.owner.id,
        owner_name: computer.device.owner.name,
        photo_url: computer.device.photoURL.toString(),
        updated_at: computer.device.updatedAt.toISOString(),
        checkin_url: computer.checkinURL.toString(),
        checkout_url: computer.checkoutURL.toString(),
        checkin_at: computer.device.checkinAt?.toISOString() ?? null,
      });

    if (error) throw error;
    return computer;
  }

  async getFrequentComputers(criteria: DeviceCriteria): Promise<FrequentComputer[]> {
    let query = this.supabase.from("frequent_computers").select("*");

    // Filtro dinámico
    if (criteria.filterBy) {
      query = query.eq(criteria.filterBy.field, criteria.filterBy.value as any);
    }

    // Orden
    if (criteria.sortBy) {
      query = query.order(criteria.sortBy.field, { ascending: criteria.sortBy.isAscending });
    }

    // Paginación
    if (criteria.limit !== undefined) {
      query = query.limit(criteria.limit);
    }
    if (criteria.offset !== undefined) {
      query = query.range(criteria.offset, criteria.offset + (criteria.limit ?? 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((row: any) => ({
      device: {
        id: row.id,
        brand: row.brand,
        model: row.model,
        owner: { id: row.owner_id, name: row.owner_name },
        photoURL: new URL(row.photo_url),
        updatedAt: new Date(row.updated_at),
        checkinAt: row.checkin_at ? new Date(row.checkin_at) : undefined,
        checkoutAt: row.checkout_at ? new Date(row.checkout_at) : undefined,
      },
      checkinURL: new URL(row.checkin_url),
      checkoutURL: new URL(row.checkout_url),
    }));
  }

  async checkinFrequentComputer(id: DeviceId, datetime: Date): Promise<FrequentComputer> {
    const { data, error } = await this.supabase
      .from("frequent_computers")
      .update({ checkin_at: datetime.toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return {
      device: {
        id: data.id,
        brand: data.brand,
        model: data.model,
        owner: { id: data.owner_id, name: data.owner_name },
        photoURL: new URL(data.photo_url),
        updatedAt: new Date(data.updated_at),
        checkinAt: data.checkin_at ? new Date(data.checkin_at) : undefined,
        checkoutAt: data.checkout_at ? new Date(data.checkout_at) : undefined,
      },
      checkinURL: new URL(data.checkin_url),
      checkoutURL: new URL(data.checkout_url),
    };
  }

  async isFrequentComputerRegistered(id: DeviceId): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("frequent_computers")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  // -------------------------------------------------------------------
  // Computers
  // -------------------------------------------------------------------

  async checkinComputer(computer: Computer): Promise<Computer> {
    const now = new Date();
    const { error } = await this.supabase
      .from("computers")
      .insert({
        id: computer.id,
        brand: computer.brand,
        model: computer.model,
        owner_id: computer.owner.id,
        owner_name: computer.owner.name,
        photo_url: computer.photoURL.toString(),
        updated_at: computer.updatedAt.toISOString(),
        checkin_at: now.toISOString(),
      });

    if (error) throw error;
    return { ...computer, checkinAt: now };
  }

  async getComputers(criteria: DeviceCriteria): Promise<Computer[]> {
    let query = this.supabase.from("computers").select("*");

    if (criteria.filterBy) {
      query = query.eq(criteria.filterBy.field, criteria.filterBy.value as any);
    }

    if (criteria.sortBy) {
      query = query.order(criteria.sortBy.field, { ascending: criteria.sortBy.isAscending });
    }

    if (criteria.limit !== undefined) {
      query = query.limit(criteria.limit);
    }
    if (criteria.offset !== undefined) {
      query = query.range(criteria.offset, criteria.offset + (criteria.limit ?? 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((row: any) => ({
      id: row.id,
      brand: row.brand,
      model: row.model,
      owner: { id: row.owner_id, name: row.owner_name },
      photoURL: new URL(row.photo_url),
      updatedAt: new Date(row.updated_at),
      checkinAt: row.checkin_at ? new Date(row.checkin_at) : undefined,
      checkoutAt: row.checkout_at ? new Date(row.checkout_at) : undefined,
    }));
  }

  // -------------------------------------------------------------------
  // Medical Devices
  // -------------------------------------------------------------------

  async checkinMedicalDevice(device: MedicalDevice): Promise<MedicalDevice> {
    const now = new Date();
    const { error } = await this.supabase
      .from("medical_devices")
      .insert({
        id: device.id,
        brand: device.brand,
        model: device.model,
        owner_id: device.owner.id,
        owner_name: device.owner.name,
        photo_url: device.photoURL.toString(),
        serial: device.serial,
        updated_at: device.updatedAt.toISOString(),
        checkin_at: now.toISOString(),
      });

    if (error) throw error;
    return { ...device, checkinAt: now };
  }

  async getMedicalDevices(criteria: DeviceCriteria): Promise<MedicalDevice[]> {
    let query = this.supabase.from("medical_devices").select("*");

    if (criteria.filterBy) {
      query = query.eq(criteria.filterBy.field, criteria.filterBy.value as any);
    }

    if (criteria.sortBy) {
      query = query.order(criteria.sortBy.field, { ascending: criteria.sortBy.isAscending });
    }

    if (criteria.limit !== undefined) {
      query = query.limit(criteria.limit);
    }
    if (criteria.offset !== undefined) {
      query = query.range(criteria.offset, criteria.offset + (criteria.limit ?? 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((row: any) => ({
      id: row.id,
      brand: row.brand,
      model: row.model,
      owner: { id: row.owner_id, name: row.owner_name },
      photoURL: new URL(row.photo_url),
      updatedAt: new Date(row.updated_at),
      serial: row.serial,
      checkinAt: row.checkin_at ? new Date(row.checkin_at) : undefined,
      checkoutAt: row.checkout_at ? new Date(row.checkout_at) : undefined,
    }));
  }

  // -------------------------------------------------------------------
  // All Devices
  // -------------------------------------------------------------------

  async getEnteredDevices(criteria: DeviceCriteria): Promise<EnteredDevice[]> {
    const [computers, medicalDevices] = await Promise.all([
      this.getComputers(criteria),
      this.getMedicalDevices(criteria),
    ]);

    const enteredComputers: EnteredDevice[] = computers.map((computer) => ({
      ...computer,
      type: "computer",
    }));

    const enteredMedicalDevices: EnteredDevice[] = medicalDevices.map((device) => ({
      ...device,
      type: "medical-device",
    }));

    return [...enteredComputers, ...enteredMedicalDevices];
  }

  // -------------------------------------------------------------------
  // Checkout + checks
  // -------------------------------------------------------------------

  async checkoutDevice(id: DeviceId, datetime: Date): Promise<void> {
    // Computers
    const { error: compError } = await this.supabase
      .from("computers")
      .update({ checkout_at: datetime.toISOString() })
      .eq("id", id);

    if (compError) throw compError;

    // Medical Devices
    const { error: medError } = await this.supabase
      .from("medical_devices")
      .update({ checkout_at: datetime.toISOString() })
      .eq("id", id);

    if (medError) throw medError;

    // Frequent Computers
    await this.supabase
      .from("frequent_computers")
      .update({ checkout_at: datetime.toISOString() })
      .eq("id", id);
  }

  async isDeviceEntered(id: DeviceId): Promise<boolean> {
    const { data: comp } = await this.supabase
      .from("computers")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (comp) return true;

    const { data: med } = await this.supabase
      .from("medical_devices")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (med) return true;

    return false;
  }
}
