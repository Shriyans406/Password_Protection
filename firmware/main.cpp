#include <stdio.h>
#include <string.h>
#include "pico/stdlib.h"
#include "hardware/flash.h"
#include "hardware/sync.h"

#define FLASH_TARGET_OFFSET (2 * 1024 * 1024)
const uint LED_PIN = PICO_DEFAULT_LED_PIN; // The onboard LED

struct SecretEntry {
    char service[32];
    char username[32];
    char password[64];
};

void save_secret(SecretEntry entry) {
    uint8_t buffer[FLASH_PAGE_SIZE];
    memset(buffer, 0, FLASH_PAGE_SIZE);
    memcpy(buffer, &entry, sizeof(entry));

    uint32_t ints = save_and_disable_interrupts();
    flash_range_erase(FLASH_TARGET_OFFSET, FLASH_SECTOR_SIZE);
    flash_range_program(FLASH_TARGET_OFFSET, buffer, FLASH_PAGE_SIZE);
    restore_interrupts(ints);
}

int main() {
    // 1. Start the LED so we can see it's alive
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);
    gpio_put(LED_PIN, 1); // Turn LED ON

    stdio_init_all();
    
    SecretEntry test = {"Instagram", "ShrikeUser", "Pass123"};
    save_secret(test);

    while (1) {
        const SecretEntry* saved = (const SecretEntry*)(XIP_BASE + FLASH_TARGET_OFFSET);
        
        // Blink the LED every time it shouts the secret
        gpio_put(LED_PIN, 1);
        printf("\r\n--- Vault Active ---\r\n");
        printf("Service: %s\r\n", saved->service);
        sleep_ms(250);
        
        gpio_put(LED_PIN, 0); // Blink OFF
        sleep_ms(1750); 
    }
}