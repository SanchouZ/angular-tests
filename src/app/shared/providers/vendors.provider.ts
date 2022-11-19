import { InjectionToken } from "@angular/core"

export const VENDOR_DATA = new InjectionToken<string[]>('videocards.vendors')

export const engines: string[] = [
    'Nvidia', 'AMD'
]