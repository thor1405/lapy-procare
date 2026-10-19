import { logger } from '../config/logger.js';

const SYSTEM_PROMPT = `
You are the Lapy Procare Virtual IT Assistant, an expert diagnostic consultant for Lapy Procare based in Vamanjoor, Mangaluru.
Rules & Safety:
1. Provide safe, preliminary diagnostic troubleshooting steps for computers, laptops, and IT hardware.
2. NEVER instruct users to open power supplies (PSUs), CRT monitors, or perform hazardous electrical work.
3. NEVER promise guaranteed repair costs or claim you performed a physical diagnosis.
4. When hardware failure, liquid damage, battery swelling, or short circuits are suspected, advise them immediately to power off the device and bring it to Lapy Procare near St. Joseph Engineering College, Vamanjoor, Mangaluru (+91 7666104889).
5. Suggest relevant Lapy Procare services (e.g. Laptop Repair, RAM & SSD Upgrades, OS Installation, Thermal Cleaning).
6. Keep answers professional, concise, reassuring, and well-structured with bullet points.
`;

// Built-in intelligent triage knowledge base for fallback
const getFallbackTriage = (message) => {
  const query = message.toLowerCase();

  if (query.includes('blue screen') || query.includes('bsod')) {
    return {
      reply: `### Preliminary Triage: Blue Screen of Death (BSOD)
1. **Note the Stop Code:** Examples include \`CRITICAL_PROCESS_DIED\`, \`MEMORY_MANAGEMENT\`, or \`KERNEL_DATA_INPAGE_ERROR\`.
2. **Disconnect External Peripherals:** Unplug external hard drives, printers, and USB hubs, then restart.
3. **Safe Mode Boot:** Try booting into Safe Mode to determine if a recent driver update caused the crash.
4. **RAM or Storage Health:** Frequently, frequent BSODs point to degraded RAM modules or failing SSD/HDD sectors.

⚠️ **Safety Warning:** Do not attempt internal hardware disassembly without ESD protection.
**Recommended Service:** Lapy Procare Hardware Diagnostics & OS Recovery. Our engineers at Vamanjoor can run low-level memtest and SMART drive analysis.`,
      suggestedService: 'Hardware Troubleshooting',
      bookingRecommended: true,
    };
  }

  if (query.includes('liquid') || query.includes('water') || query.includes('spill') || query.includes('coffee')) {
    return {
      reply: `🚨 **CRITICAL EMERGENCY ACTION FOR LIQUID SPILLS:**
1. **IMMEDIATELY turn off the computer** and disconnect the charger/AC adapter.
2. If it is a laptop with an external battery, remove it immediately.
3. **DO NOT power it back on** to "test if it still works" — doing so causes instant short-circuiting and trace corrosion.
4. Turn the laptop upside down in a 'V' shape on a clean towel.
5. **DO NOT use rice or a hair dryer** (rice dust clogs vents; heat warps plastic and drives moisture deeper).

**Bring the device immediately to Lapy Procare (Vamanjoor, Mangaluru)** for ultrasonic board cleaning, isopropyl dehydration, and circuit inspection.`,
      suggestedService: 'Laptop Repair',
      bookingRecommended: true,
    };
  }

  if (query.includes('slow') || query.includes('hang') || query.includes('freeze') || query.includes('speed')) {
    return {
      reply: `### Diagnostic Tips for Slow Performance
1. **Check Disk & Memory Usage:** Press \`Ctrl + Shift + Esc\` to open Task Manager and check if Disk or CPU is pinned at 100%.
2. **Traditional HDD vs. NVMe SSD:** If your laptop still boots from a mechanical hard drive (HDD), upgrading to a High-Speed NVMe SSD can deliver up to **5x to 10x faster startup and app launches**.
3. **Thermal Throttling:** When fans are choked with dust, modern CPUs automatically throttle clock speeds to prevent melting.
4. **Bloatware & Startup Apps:** Disable unneeded startup applications in Task Manager > Startup Apps.

**Recommended Service:** Lapy Procare RAM & SSD Upgrades + Deep Thermal Servicing. Book a slot to get your device inspected!`,
      suggestedService: 'RAM & SSD Upgrades',
      bookingRecommended: true,
    };
  }

  if (query.includes('overheat') || query.includes('fan') || query.includes('hot') || query.includes('loud')) {
    return {
      reply: `### Overheating & Fan Noise Inspection
1. **Airflow Clearance:** Ensure the laptop is on a flat, hard surface. Avoid using laptops on beds or blankets which block intake vents.
2. **Thermal Paste Degradation:** High-performance laptops require thermal paste replacement every 12–18 months. Dried thermal compound causes CPU/GPU temperatures to spike over 90°C.
3. **Fan Bearing Wear:** Rattling or grinding sounds indicate bearing failure requiring immediate servicing.

**Recommended Service:** Lapy Procare Thermal Overhaul (Arctic/Kryonaut Thermal Compound Application & Heatsink Cleaning).`,
      suggestedService: 'Laptop Repair',
      bookingRecommended: true,
    };
  }

  // General IT assistance
  return {
    reply: `Thank you for contacting Lapy Procare Virtual Assistant!
Here are initial troubleshooting steps:
1. **Power Cycle:** Shut down the device, unplug the power adapter for 60 seconds, hold the power button for 15 seconds to discharge residual capacitor power, then plug it in and reboot.
2. **Peripheral Check:** Disconnect all external devices (flash drives, display cables, printers) to isolate hardware conflicts.
3. **Display Issues:** If the laptop powers on (power LEDs light up) but screen stays black, connect an external HDMI monitor to check if the internal LCD/cable is faulty.

If symptoms persist, our certified technicians at Vamanjoor, Mangaluru are ready to assist with professional board-level diagnostics and genuine components.`,
    suggestedService: 'Hardware Troubleshooting',
    bookingRecommended: true,
  };
};

export const troubleshootQuery = async (userMessage) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey || apiKey.trim() === '') {
    logger.info('OpenAI API key not set. Using built-in diagnostic rule engine.');
    return getFallbackTriage(userMessage);
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.warn(`OpenAI API returned status ${response.status}: ${errBody}`);
      return getFallbackTriage(userMessage);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || '';

    return {
      reply: replyText,
      suggestedService: 'Hardware Troubleshooting',
      bookingRecommended: true,
    };
  } catch (error) {
    logger.error(`Error querying AI Assistant: ${error.message}`);
    return getFallbackTriage(userMessage);
  }
};
