# ioBroker.eheim-digital

[![NPM version](https://img.shields.io/npm/v/iobroker.eheim-digital.svg)](https://www.npmjs.com/package/iobroker.eheim-digital)
[![Downloads](https://img.shields.io/npm/dm/iobroker.eheim-digital.svg)](https://www.npmjs.com/package/iobroker.eheim-digital)
![Number of Installations](https://iobroker.live/badges/eheim-digital-installed.svg)
[![Current State](https://img.shields.io/badge/status-stable-green.svg)]()

**ioBroker.eheim-digital** is an advanced, lightweight, and highly dynamic adapter designed to integrate the smart ecosystem of **Eheim Digital** aquarium components into your ioBroker home automation network. 

By utilizing the local REST API of your Eheim master device (or gateway hub), this adapter pulls both device configurations and live operational values on a customizable schedule, translating them automatically into easily accessible ioBroker states.

---

## Features

* **Dynamic Data-Point Creation:** No hardcoded structures. The adapter recursively parses JSON payloads from the API and dynamically builds the object tree.
* **Fault-Tolerant Scanning:** Automatically queries all official Eheim API endpoints but safely skips devices that are not part of your local Eheim Mesh network without crashing.
* **Full Device Coverage:** Supports the entire modern Eheim smart lineup (GET requests):
  * **General:** Master Hub Network & Mesh topology configurations
  * **LEDcontrol Series:** Light schedules, current dimming percentages, modes
  * **Professionel 5e:** Flow rates ($l/h$), filter load, next cleaning timer
  * **Thermocontrol+e:** Target vs. actual temperatures, heating states
  * **pHcontrol+e:** Live pH metrics, calibration data, $CO_2$ solenoid valve status
  * **Autofeeder+:** Feeding timers, rotations, low-food warnings, battery status
  * **ReeflexUV+e:** UV-C lamp runtime hours, operational status
  * **Climacontrol+:** Chiller/heater status, live water temps, standby conditions
  * **ClassicVARIO+e:** Delivery pump output power, error states
  * **AquaAlert+e:** Leak sensor trigger states, battery notifications
* **Modern JSON-Config UI:** Full integration with ioBroker Admin 5/6+ configuration panels.

---

## Configuration

Setting up the adapter takes less than a minute through the Admin tab:

1. **Master IP-Address:** Enter the local IP address of your Eheim Master Controller (e.g., `192.168.2.131`).
2. **Authorization Header:** Provide your API token (`Basic <base64-string>`) for securing the connection.
3. **Polling Interval:** Specify how often the adapter updates the values (default: `30000` ms / 30 seconds).
4. **Device Inventory (Optional):** A built-in grid allows you to register device names, select types, and track MAC addresses for organizational purposes within your smart home ecosystem.

---

## Object Structure Example

Once running, the adapter will organize your aquarium data under `eheim-digital.0` using a clean, device-specific folder tree:

* `eheim-digital.0.light.current_values` (e.g., active channels, brightness levels)
* `eheim-digital.0.filter.current_values` (e.g., flow rate, pollution stats)
* `eheim-digital.0.heater.current_values` (e.g., water temperature)

---

## Installation & Requirements

* **Node.js** v18 or higher (utilizes native `fetch` API)
* **ioBroker.js-controller** >= v5.0.0

To install manually before it hits the official repository, navigate to your ioBroker root directory and run:
```bash
npm install iobroker.eheim-digital
