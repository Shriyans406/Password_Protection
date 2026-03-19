#include <stdio.h>
#include <string.h>
#include "pico/stdlib.h"
#include "hardware/flash.h"
#include "hardware/sync.h"

// Saving data at the 2MB mark to stay away from the main program
#define FLASH_TARGET_OFFSET (2 * 1024 * 1024)

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
    stdio_init_all();
    sleep_ms(5000); // Give you time to open the monitor

    SecretEntry test = {"Instagram", "ShrikeUser", "Pass123"};
    save_secret(test);

    // Read it back to verify
    const SecretEntry* saved = (const SecretEntry*)(XIP_BASE + FLASH_TARGET_OFFSET);
    printf("Vault Loaded: %s | %s\n", saved->service, saved->username);

    while (1) { tight_loop_contents(); }
}