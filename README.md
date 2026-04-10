# FortressKey

FortressKey is a hardware-based password protection system that uses a Raspberry Pi Pico to store and decrypt credentials. It implements a physical "Secure Gate" where passwords can only be decrypted and viewed after a physical interaction with the hardware.

## Architecture

The project is divided into three main layers:

1.  **Firmware (C++)**: Runs on a Raspberry Pi Pico. It handles encryption using the Monocypher library (ChaCha20) and manages the physical authorization trigger.
2.  **Backend (TypeScript/Bun)**: A bridge server that reads serial data from the hardware via a PowerShell pipe and serves it through a REST API (Elysia).
3.  **Frontend (SolidJS)**: A web-based dashboard that provides real-time telemetry of the vault status and reveals decrypted credentials when authorized.

## Hardware Setup

- **Microcontroller**: Raspberry Pi Pico.
- **Physical Trigger**: Connect **GPIO 20** to a button or use a jumper wire.
- **Authorization**: Decryption is only active when **GPIO 20 is pulled to Ground (LOW)**.
- **Visual Feedback**: The onboard LED (GPIO 25) lights up when the system is authorized (unlocked).

## How It Works

1.  The Pico stores service names and encrypted password hashes.
2.  Data is continuously streamed over USB Serial in an encrypted/locked state.
3.  The Backend monitors the serial port (default: `COM9`) and parses the stream.
4.  When the physical button is pressed (GPIO 20 pulled to Ground), the Pico performs in-memory decryption and sends the plaintext over serial.
5.  The Frontend polls the backend every 2 seconds to update the UI.

## Getting Started

### 1. Firmware
Requires the Raspberry Pi Pico SDK.

- **Build**:
    1. Open the `firmware` folder.
    2. Create a `build` directory.
    3. Run `cmake ..` followed by `make` (or use the VS Code Pico extension).
- **Flash**: Copy the resulting `FortressKey.uf2` to your Pico in bootloader mode.

### 2. Backend
Requires [Bun](https://bun.sh).

- **Install**:
    ```bash
    cd backend
    bun install
    ```
- **Configure**: Open `backend/index.ts` and ensure the COM port matches your device (default is `COM9`).
- **Run**:
    ```bash
    bun run index.ts
    ```

### 3. Frontend
Requires [Node.js](https://nodejs.org) or Bun.

- **Install**:
    ```bash
    cd frontend
    bun install
    ```
- **Run**:
    ```bash
    bun run dev
    ```
- **Access**: Open `http://localhost:5173` in your browser.

## Project Structure

- `firmware/`: C++ source code and Monocypher implementation.
- `backend/`: Elysia server and serial bridge logic.
- `frontend/`: SolidJS application with Tailwind styling.

## Security Notes

- This project uses the **ChaCha20** cipher for encryption.
- A physical master key is hardcoded in `firmware/main.cpp` for demonstration purposes.
- Decryption happens entirely on the microcontroller hardware.
