# This tells the computer where your SDK is
set(PICO_SDK_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../pico-sdk")

cmake_minimum_required(VERSION 3.13)

# Pull in the tools
include(${PICO_SDK_PATH}/external/pico_sdk_import.cmake)

project(FortressKey C CXX ASM)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

pico_sdk_init()

add_executable(FortressKey main.cpp)

# Link the Flash memory and USB libraries
target_link_libraries(FortressKey pico_stdlib hardware_flash)

# Enable USB output so we can talk to the board
pico_enable_stdio_usb(FortressKey 1)
pico_enable_stdio_uart(FortressKey 0)

pico_add_extra_outputs(FortressKey)