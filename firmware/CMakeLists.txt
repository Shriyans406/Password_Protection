# 1. Tell the computer exactly where the "Instruction Manual" (SDK) is
set(PICO_SDK_PATH "C:/Program Files/Raspberry Pi/Pico SDK v1.5.1/pico-sdk")

cmake_minimum_required(VERSION 3.13)

# 2. Pull in the "Tools" from that path
include(${PICO_SDK_PATH}/external/pico_sdk_import.cmake)

project(FortressKey C CXX ASM)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

# 3. Wake up the Shrike Lite hardware
pico_sdk_init()

add_executable(FortressKey main.cpp)

# 4. Link the Flash memory and USB libraries
target_link_libraries(FortressKey pico_stdlib hardware_flash)

# 5. VERY IMPORTANT: This tells the board to act like a COM port (USB)
pico_enable_stdio_usb(FortressKey 1)
pico_enable_stdio_uart(FortressKey 0)

pico_add_extra_outputs(FortressKey)