set(PICO_SDK_PATH "C:/Program Files/Raspberry Pi/Pico SDK v1.5.1/pico-sdk")

cmake_minimum_required(VERSION 3.13)

include(${PICO_SDK_PATH}/external/pico_sdk_import.cmake)

project(FortressKey C CXX ASM)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

pico_sdk_init()

add_executable(FortressKey 
    main.cpp 
    lib/monocypher.c
)

# Link the libraries. The order doesn't usually matter, but they MUST be there.
target_link_libraries(FortressKey 
    pico_stdlib 
    hardware_flash 
)

target_include_directories(FortressKey PRIVATE lib)

pico_enable_stdio_usb(FortressKey 1)
pico_enable_stdio_uart(FortressKey 0)

pico_add_extra_outputs(FortressKey)