"use strict";

const utils = require("@iobroker/adapter-core");

class EheimDigital extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "eheim-digital",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("unload", this.onUnload.bind(this));
        
        this.updateInterval = null;
        
        // Liste aller GET-Endpoints laut API-Dokumentation
        this.apiEndpoints = [
            // General
            { path: "device/config", folder: "general.config" },
            { path: "device/mesh", folder: "general.mesh" },
            // LEDcontrol
            { path: "light/config", folder: "light.config" },
            { path: "light/current-values", folder: "light.current_values" },
            // Professionel 5e
            { path: "filter/config", folder: "filter.config" },
            { path: "filter/current-values", folder: "filter.current_values" },
            // Thermocontrol+e
            { path: "heater/config", folder: "heater.config" },
            { path: "heater/current-values", folder: "heater.current_values" },
            // pHcontrol+e
            { path: "phcontrol/config", folder: "phcontrol.config" },
            { path: "phcontrol/current-values", folder: "phcontrol.current_values" },
            // Autofeeder+
            { path: "feeder/config", folder: "feeder.config" },
            { path: "feeder/current-values", folder: "feeder.current_values" },
            // ReeflexUV+e
            { path: "uv/config", folder: "uv.config" },
            { path: "uv/current-values", folder: "uv.current_values" },
            // Climacontrol+
            { path: "climacontrol/config", folder: "climacontrol.config" },
            { path: "climacontrol/current-values", folder: "climacontrol.current_values" },
            // ClassicVARIO+e
            { path: "pump/config", folder: "pump.config" },
            { path: "pump/current-values", folder: "pump.current_values" },
            // AquaAlert+e
            { path: "alert/config", folder: "alert.config" },
            { path: "alert/current-values", folder: "alert.current_values" }
        ];
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        this.log.info("Eheim Digital Adapter gestartet. Starte zyklische Abfrage aller Endpoints...");

        // Erste Abfrage aller Geräte beim Start
        await this.fetchAllEheimDevices();

        // Intervall einrichten (Standard: Alle 30 Sekunden)
        const intervalTime = this.config.interval || 30000; 
        this.updateInterval = this.setInterval(async () => {
            await this.fetchAllEheimDevices();
        }, intervalTime);
    }

    /**
     * Schaft eine Schleife über alle definierten Endpoints
     */
    async fetchAllEheimDevices() {
        const ip = this.config.ip || "192.168.2.131";
        const authHeader = this.config.authHeader || "Basic PHVzZXJuYW1lPjo8cGFzc3dvcmQ+";

        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", authHeader);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        for (const endpoint of this.apiEndpoints) {
            const url = `http://${ip}/api/${endpoint.path}`;
            
            try {
                this.log.debug(`Frage ab: ${url}`);
                const response = await fetch(url, requestOptions);
                
                // Falls ein Gerät nicht existiert (z.B. kein Filter im Mesh), gibt die API oft 404 oder 500.
                if (!response.ok) {
                    this.log.debug(`Endpoint ${endpoint.path} nicht verfügbar (Status: ${response.status}). Überspringe.`);
                    continue;
                }

                const data = await response.json();
                
                // Werte unter dem passenden Ordner (z.B. "light.current_values") abspeichern
                await this.parseAndSetStates(endpoint.folder, data);

            } catch (error) {
                this.log.debug(`Fehler beim Abruf von ${endpoint.path}: ${error.message}`);
            }
        }
    }

    /**
     * Parst das JSON-Ergebnis rekursiv und legt Datenpunkte automatisch an
     */
    async parseAndSetStates(prefix, obj) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const sanitizedKey = key.replace(/[\][*?,;'"`<>\s]/g, "_");
                const dpName = prefix ? `${prefix}.${sanitizedKey}` : sanitizedKey;

                if (typeof value === "object" && value !== null) {
                    await this.parseAndSetStates(dpName, value);
                } else {
                    let type = "mixed";
                    if (typeof value === "boolean") type = "boolean";
                    else if (typeof value === "number") type = "number";
                    else if (typeof value === "string") type = "string";

                    await this.setObjectNotExistsAsync(dpName, {
                        type: "state",
                        common: {
                            name: key,
                            type: type,
                            role: "value",
                            read: true,
                            write: false,
                        },
                        native: {},
                    });

                    await this.setStateAsync(dpName, { val: value, ack: true });
                }
            }
        }
    }

    /**
     * Is called when adapter shuts down.
     */
    onUnload(callback) {
        try {
            if (this.updateInterval) {
                this.clearInterval(this.updateInterval);
            }
            this.log.info("Eheim Digital Adapter sauber beendet.");
            callback();
        } catch (e) {
            callback();
        }
    }
}

if (require.main !== module) {
    module.exports = (options) => new EheimDigital(options);
} else {
    new EheimDigital();
}
