import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SpookyButton } from './SpookyButton';
import { LEVELS, GLYPHS } from './corruptionConstants';

interface SignalCorruptionGameProps {
  onExit: () => void;
  onVictory?: () => void;
}

type GamePhase = 'INTRO' | 'WAVEFORM' | 'GLYPH' | 'PURGE' | 'VICTORY' | 'FAILURE';

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const GlitchText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="relative font-display font-bold text-4xl md:text-6xl text-neon-red" data-text={text}>
      {text}
      <div className="absolute inset-0 animate-glitch" data-text={text}>{text}</div>
    </div>
  );
};


export const SignalCorruptionGame: React.FC<SignalCorruptionGameProps> = ({ onExit, onVictory }) => {
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('INTRO');
  const [introText, setIntroText] = useState('');
  
  const config = useMemo(() => LEVELS[level], [level]);

  const handleRestart = () => {
    setLevel(0);
    setPhase('INTRO');
  };

  const advanceLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(prev => prev + 1);
      setPhase('WAVEFORM');
    } else {
      setPhase('VICTORY');
    }
  };

  // --- INTRO ---
  // No automatic transition - user must click "START HUNTING" button

  // OLD BOOT SEQUENCE CODE (REMOVED)
  useEffect(() => {
    if (false) { // Disabled
      const bootSequence = [
        '╔═══════════════════════════════════════════════════════════════╗',
        '║              VOID TERMINAL - ACCESS GRANTED                   ║',
        '╚═══════════════════════════════════════════════════════════════╝',
        '',
        '[SYSTEM] Initializing...',
        '[OK] Authentication verified',
        '[ALERT] Corruption detected - Threat level: CRITICAL',
        '',
        '[MENTOR] Welcome, Operator.',
        '[MENTOR] Malicious entities have infected the system.',
        '[MENTOR] You must locate and eliminate these threats.',
        '[MENTOR] Complete all tasks to restore functionality.',
        '[MENTOR] Your reward: Full access to create your transformation.',
        '',
        '> Preparing purge protocol...',
        '[0.014556] tsc: Fast TSC calibration using PIT',
        '[0.015667] tsc: Detected 3600.000 MHz processor',
        '[0.016778] e820: update [mem 0x00000000-0x00000fff] usable ==> reserved',
        '[0.017889] e820: remove [mem 0x000a0000-0x000fffff] usable',
        '[0.018990] last_pfn = 0x41f800 max_arch_pfn = 0x400000000',
        '[0.020101] x86/PAT: Configuration [0-7]: WB WC UC- UC WB WP UC- WT',
        '[0.021212] total RAM covered: 16383M',
        '[0.022323] Found optimal setting for mtrr clean up',
        '[0.023434] gran_size: 64K chunk_size: 64K num_reg: 10 lose cover RAM: 0G',
        '[0.024545] e820: update [mem 0xd0000000-0xffffffff] usable ==> reserved',
        '[0.025656] last_pfn = 0xd0000 max_arch_pfn = 0x400000000',
        '[0.026767] esrt: Reserving ESRT space from 0x00000000daf7e000 to 0x00000000daf7e088.',
        '[0.027878] e820: update [mem 0xdaf7e000-0xdaf7e087] usable ==> reserved',
        '[0.028989] Using GB pages for direct mapping',
        '[0.030090] Secure boot disabled',
        '[0.031101] RAMDISK: [mem 0x35b79000-0x36b78fff]',
        '[0.032212] ACPI: Early table checksum verification disabled',
        '[0.033323] ACPI: RSDP 0x00000000000F0490 000024 (v02 VOIDPC)',
        '[0.034434] ACPI: XSDT 0x00000000DAF8E0E8 0000F4 (v01 VOIDPC VOID 01072009 AMI 00010013)',
        '[0.035545] ACPI: FACP 0x00000000DAFA6B00 000114 (v06 VOIDPC VOID 01072009 AMI 00010013)',
        '[0.036656] ACPI: DSDT 0x00000000DAF8E280 018878 (v02 VOIDPC VOID 01072009 INTL 20120913)',
        '[0.037767] ACPI: FACS 0x00000000DAFCEF80 000040',
        '[0.038878] ACPI: APIC 0x00000000DAFA6C18 0000BC (v04 VOIDPC VOID 01072009 AMI 00010013)',
        '[0.039989] ACPI: FPDT 0x00000000DAFA6CD8 000044 (v01 VOIDPC VOID 01072009 AMI 00010013)',
        '[0.041090] ACPI: FIDT 0x00000000DAFA6D20 00009C (v01 VOIDPC VOID 01072009 AMI 00010013)',
        '[0.042201] ACPI: MCFG 0x00000000DAFA6DC0 00003C (v01 VOIDPC VOID 01072009 MSFT 00000097)',
        '[0.043312] ACPI: SSDT 0x00000000DAFA6E00 000E58 (v02 CpuRef CpuSsdt 00003000 INTL 20120913)',
        '[0.044423] ACPI: SSDT 0x00000000DAFA7C58 0003A8 (v02 SaSsdt SaSsdt 00003000 INTL 20120913)',
        '[0.045534] ACPI: HPET 0x00000000DAFA8000 000038 (v01 INTEL VOID 00000001 INTL 20120913)',
        '[0.046645] ACPI: SSDT 0x00000000DAFA8038 000FAE (v02 INTEL Ther_Rvp 00001000 INTL 20120913)',
        '[0.047756] ACPI: SSDT 0x00000000DAFA8FE8 0030EA (v02 SaSsdt SaSsdt 00003000 INTL 20120913)',
        '[0.048867] ACPI: UEFI 0x00000000DAFAC0D8 000042 (v01 INTEL VOID 00000000 INTL 00000000)',
        '[0.049978] ACPI: LPIT 0x00000000DAFAC120 000094 (v01 INTEL VOID 00000000 MSFT 0000005F)',
        '[0.051089] ACPI: WSMT 0x00000000DAFAC1B8 000028 (v01 INTEL VOID 00000000 MSFT 0000005F)',
        '[0.052190] ACPI: SSDT 0x00000000DAFAC1E0 00029F (v02 INTEL PtidDevc 00001000 INTL 20120913)',
        '[0.053301] ACPI: SSDT 0x00000000DAFAC480 003A4D (v02 INTEL TbtTypeC 00000000 INTL 20120913)',
        '[0.054412] ACPI: DBGP 0x00000000DAFAFED0 000034 (v01 INTEL VOID 00000000 MSFT 0000005F)',
        '[0.055523] ACPI: DBG2 0x00000000DAFAFF08 000054 (v00 INTEL VOID 00000000 MSFT 0000005F)',
        '[0.056634] ACPI: BGRT 0x00000000DAFAFF60 000038 (v01 INTEL VOID 01072009 AMI 00010013)',
        '[0.057745] ACPI: DMAR 0x00000000DAFAFF98 0000A8 (v01 INTEL VOID 00000001 INTL 00000001)',
        '[0.058856] ACPI: Reserving FACP table memory at [mem 0xdafa6b00-0xdafa6c13]',
        '[0.059967] ACPI: Reserving DSDT table memory at [mem 0xdaf8e280-0xdafa6af7]',
        '[0.061078] ACPI: Reserving FACS table memory at [mem 0xdafcef80-0xdafcefbf]',
        '[0.062189] ACPI: Reserving APIC table memory at [mem 0xdafa6c18-0xdafa6cd3]',
        '[0.063290] ACPI: Reserving FPDT table memory at [mem 0xdafa6cd8-0xdafa6d1b]',
        '[0.064401] ACPI: Reserving FIDT table memory at [mem 0xdafa6d20-0xdafa6dbb]',
        '[0.065512] ACPI: Reserving MCFG table memory at [mem 0xdafa6dc0-0xdafa6dfb]',
        '[0.066623] No NUMA configuration found',
        '[0.067734] Faking a node at [mem 0x0000000000000000-0x000000041f7fffff]',
        '[0.068845] NODE_DATA(0) allocated [mem 0x41f7d5000-0x41f7fffff]',
        '[0.069956] Zone ranges:',
        '[0.071067] DMA [mem 0x0000000000001000-0x0000000000ffffff]',
        '[0.072178] DMA32 [mem 0x0000000001000000-0x00000000ffffffff]',
        '[0.073289] Normal [mem 0x0000000100000000-0x000000041f7fffff]',
        '[0.074390] Device empty',
        '[0.075501] Movable zone start for each node',
        '[0.076612] Early memory node ranges',
        '[0.077723] node 0: [mem 0x0000000000001000-0x000000000009efff]',
        '[0.078834] node 0: [mem 0x0000000000100000-0x00000000d9c7efff]',
        '[0.079945] node 0: [mem 0x00000000dafff000-0x00000000daffffff]',
        '[0.081056] node 0: [mem 0x0000000100000000-0x000000041f7fffff]',
        '[0.082167] Initmem setup node 0 [mem 0x0000000000001000-0x000000041f7fffff]',
        '[0.083278] On node 0, zone DMA: 1 pages in unavailable ranges',
        '[0.084389] On node 0, zone DMA: 97 pages in unavailable ranges',
        '[0.085490] On node 0, zone Normal: 12672 pages in unavailable ranges',
        '[0.086601] On node 0, zone Normal: 2048 pages in unavailable ranges',
        '[0.087712] Reserving Intel graphics memory at [mem 0xdc000000-0xdfbfffff]',
        '[0.088823] ACPI: PM-Timer IO Port: 0x1808',
        '[0.089934] ACPI: LAPIC_NMI (acpi_id[0x01] high edge lint[0x1])',
        '[0.091045] ACPI: LAPIC_NMI (acpi_id[0x02] high edge lint[0x1])',
        '[0.092156] ACPI: LAPIC_NMI (acpi_id[0x03] high edge lint[0x1])',
        '[0.093267] ACPI: LAPIC_NMI (acpi_id[0x04] high edge lint[0x1])',
        '[0.094378] IOAPIC[0]: apic_id 2, version 32, address 0xfec00000, GSI 0-119',
        '[0.095489] ACPI: INT_SRC_OVR (bus 0 bus_irq 0 global_irq 2 dfl dfl)',
        '[0.096590] ACPI: INT_SRC_OVR (bus 0 bus_irq 9 global_irq 9 high level)',
        '[0.097701] ACPI: Using ACPI (MADT) for SMP configuration information',
        '[0.098812] ACPI: HPET id: 0x8086a201 base: 0xfed00000',
        '[0.099923] TSC deadline timer available',
        '[0.101034] smpboot: Allowing 8 CPUs, 0 hotplug CPUs',
        '[0.102145] PM: hibernation: Registered nosave memory: [mem 0x00000000-0x00000fff]',
        '[0.103256] PM: hibernation: Registered nosave memory: [mem 0x0009f000-0x0009ffff]',
        '[0.104367] PM: hibernation: Registered nosave memory: [mem 0x000a0000-0x000effff]',
        '[0.105478] PM: hibernation: Registered nosave memory: [mem 0x000f0000-0x000fffff]',
        '[0.106589] PM: hibernation: Registered nosave memory: [mem 0xd9c7f000-0xda0a0fff]',
        '[0.107690] PM: hibernation: Registered nosave memory: [mem 0xda0a1000-0xdaf7dfff]',
        '[0.108801] PM: hibernation: Registered nosave memory: [mem 0xdaf7e000-0xdaffefff]',
        '[0.109912] PM: hibernation: Registered nosave memory: [mem 0xdb000000-0xdbffffff]',
        '[0.111023] PM: hibernation: Registered nosave memory: [mem 0xdc000000-0xdfbfffff]',
        '[0.112134] PM: hibernation: Registered nosave memory: [mem 0xdfc00000-0xf7ffffff]',
        '[0.113245] PM: hibernation: Registered nosave memory: [mem 0xf8000000-0xfdffffff]',
        '[0.114356] PM: hibernation: Registered nosave memory: [mem 0xfe000000-0xfe010fff]',
        '[0.115467] PM: hibernation: Registered nosave memory: [mem 0xfe011000-0xfebfffff]',
        '[0.116578] PM: hibernation: Registered nosave memory: [mem 0xfec00000-0xfec00fff]',
        '[0.117689] PM: hibernation: Registered nosave memory: [mem 0xfec01000-0xfecfffff]',
        '[0.118790] PM: hibernation: Registered nosave memory: [mem 0xfed00000-0xfed03fff]',
        '[0.119901] PM: hibernation: Registered nosave memory: [mem 0xfed04000-0xfed1bfff]',
        '[0.121012] PM: hibernation: Registered nosave memory: [mem 0xfed1c000-0xfed1ffff]',
        '[0.122123] PM: hibernation: Registered nosave memory: [mem 0xfed20000-0xfedfffff]',
        '[0.123234] [mem 0xdfc00000-0xf7ffffff] available for PCI devices',
        '[0.234567] Booting paravirtualized kernel on bare hardware',
        '[0.235678] clocksource: refined-jiffies: mask: 0xffffffff max_cycles: 0xffffffff',
        '[0.236789] setup_percpu: NR_CPUS:8192 nr_cpumask_bits:8 nr_cpu_ids:8 nr_node_ids:1',
        '[0.237890] percpu: Embedded 62 pages/cpu s217088 r8192 d28672 u262144',
        '[0.238901] pcpu-alloc: s217088 r8192 d28672 u262144 alloc=1*2097152',
        '[0.240012] pcpu-alloc: [0] 0 1 2 3 4 5 6 7',
        '[0.241123] Fallback order for Node 0: 0',
        '[0.242234] Built 1 zonelists, mobility grouping on. Total pages: 4110337',
        '[0.243345] Policy zone: Normal',
        '[0.244456] Kernel command line: BOOT_IMAGE=/boot/vmlinuz-6.6.6-void root=UUID=666-void ro quiet splash',
        '[0.245567] Unknown kernel command line parameters "splash", will be passed to user space.',
        '[0.246678] printk: log_buf_len individual max cpu contribution: 32768 bytes',
        '[0.247789] printk: log_buf_len total cpu_extra contributions: 229376 bytes',
        '[0.248890] printk: log_buf_len min size: 131072 bytes',
        '[0.250001] printk: log_buf_len: 524288 bytes',
        '[0.251112] printk: early log buf free: 115896(88%)',
        '[0.252223] Dentry cache hash table entries: 2097152 (order: 12, 16777216 bytes, linear)',
        '[0.253334] Inode-cache hash table entries: 1048576 (order: 11, 8388608 bytes, linear)',
        '[0.254445] mem auto-init: stack:all(zero), heap alloc:on, heap free:off',
        '[0.255556] software IO TLB: area num 8.',
        '[0.256667] Memory: 16252468K/16703488K available (16384K kernel code, 3452K rwdata)',
        '[0.257778] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=8, Nodes=1',
        '[0.258889] ftrace: allocating 49152 entries in 192 pages',
        '[0.259990] ftrace: allocated 192 pages with 6 groups',
        '[0.261101] Dynamic Preempt: voluntary',
        '[0.262212] rcu: Preemptible hierarchical RCU implementation.',
        '[0.263323] rcu: RCU restricting CPUs from NR_CPUS=8192 to nr_cpu_ids=8.',
        '[0.264434] Trampoline variant of Tasks RCU enabled.',
        '[0.265545] Rude variant of Tasks RCU enabled.',
        '[0.266656] Tracing variant of Tasks RCU enabled.',
        '[0.267767] rcu: RCU calculated value of scheduler-enlistment delay is 25 jiffies.',
        '[0.268878] rcu: Adjusting geometry for rcu_fanout_leaf=16, nr_cpu_ids=8',
        '[0.269989] NR_IRQS: 524544, nr_irqs: 2048, preallocated irqs: 16',
        '[0.271090] rcu: srcu_init: Setting srcu_struct sizes based on contention.',
        '[0.272201] kfence: initialized - using 2097152 bytes for 255 objects at 0x(____ptrval____)-0x(____ptrval____)',
        '[0.273312] Console: colour dummy device 80x25',
        '[0.274423] printk: console [tty0] enabled',
        '[0.275534] ACPI: Core revision 20231122',
        '[0.276645] hpet: HPET dysfunctional in PC10. Force disabled.',
        '[0.277756] APIC: Switch to symmetric I/O mode setup',
        '[0.278867] DMAR: Host address width 39',
        '[0.279978] DMAR: DRHD base: 0x000000fed90000 flags: 0x0',
        '[0.281089] DMAR: dmar0: reg_base_addr fed90000 ver 4:0 cap 1c0000c40660462 ecap 29a00f0505e',
        '[0.282190] DMAR: DRHD base: 0x000000fed91000 flags: 0x1',
        '[0.283301] DMAR: dmar1: reg_base_addr fed91000 ver 1:0 cap d2008c40660462 ecap f050da',
        '[0.284412] DMAR: RMRR base: 0x000000d9800000 end: 0x000000d981ffff',
        '[0.285523] DMAR: RMRR base: 0x000000db800000 end: 0x000000dfbfffff',
        '[0.286634] DMAR-IR: IOAPIC id 2 under DRHD base 0xfed91000 IOMMU 1',
        '[0.287745] DMAR-IR: HPET id 0 under DRHD base 0xfed91000',
        '[0.288856] DMAR-IR: Queued invalidation will be enabled to support x2apic and Intr-remapping.',
        '[0.289967] DMAR-IR: Enabled IRQ remapping in x2apic mode',
        '[0.291078] x2apic enabled',
        '[0.292189] APIC: Switched APIC routing to: cluster x2apic',
        '[0.293290] clocksource: tsc-early: mask: 0xffffffffffffffff max_cycles: 0x33e452fbb2f',
        '[0.294401] Calibrating delay loop (skipped), value calculated using timer frequency.. 7200.00',
        '[0.295512] pid_max: default: 32768 minimum: 301',
        '[0.296623] LSM: initializing lsm=lockdown,capability,landlock,yama,integrity,apparmor',
        '[0.297734] landlock: Up and running.',
        '[0.298845] Yama: becoming mindful.',
        '[0.299956] AppArmor: AppArmor initialized',
        '[0.301067] Mount-cache hash table entries: 32768 (order: 6, 262144 bytes, linear)',
        '[0.302178] Mountpoint-cache hash table entries: 32768 (order: 6, 262144 bytes, linear)',
        '[0.303289] CPU0: Thermal monitoring enabled (TM1)',
        '[0.304390] process: using mwait in idle threads',
        '[0.305501] Last level iTLB entries: 4KB 64, 2MB 8, 4MB 8',
        '[0.306612] Last level dTLB entries: 4KB 64, 2MB 0, 4MB 0, 1GB 4',
        '[0.307723] Spectre V1 : Mitigation: usercopy/swapgs barriers and __user pointer sanitization',
        '[0.308834] Spectre V2 : Mitigation: Enhanced / Automatic IBRS',
        '[0.309945] Spectre V2 : Spectre v2 / SpectreRSB mitigation: Filling RSB on context switch',
        '[0.311056] Spectre V2 : Spectre v2 / PBRSB-eIBRS: Retire a single CALL on VMEXIT',
        '[0.312167] RETBleed: Mitigation: Enhanced IBRS',
        '[0.313278] Spectre V2 : mitigation: Enabling conditional Indirect Branch Prediction Barrier',
        '[0.314389] Speculative Store Bypass: Mitigation: Speculative Store Bypass disabled via prctl',
        '[0.315490] MDS: Mitigation: Clear CPU buffers',
        '[0.316601] MMIO Stale Data: Mitigation: Clear CPU buffers',
        '[0.317712] SRBDS: Mitigation: Microcode',
        '[0.318823] GDS: Mitigation: Microcode',
        '[0.319934] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'',
        '[0.321045] x86/fpu: Supporting XSAVE feature 0x002: \'SSE registers\'',
        '[0.322156] x86/fpu: Supporting XSAVE feature 0x004: \'AVX registers\'',
        '[0.323267] x86/fpu: Supporting XSAVE feature 0x020: \'AVX-512 opmask\'',
        '[0.324378] x86/fpu: Supporting XSAVE feature 0x040: \'AVX-512 Hi256\'',
        '[0.325489] x86/fpu: Supporting XSAVE feature 0x080: \'AVX-512 ZMM_Hi256\'',
        '[0.326590] x86/fpu: Supporting XSAVE feature 0x200: \'Protection Keys User registers\'',
        '[0.327701] x86/fpu: xstate_offset[2]:  576, xstate_sizes[2]:  256',
        '[0.328812] x86/fpu: xstate_offset[5]:  832, xstate_sizes[5]:   64',
        '[0.329923] x86/fpu: xstate_offset[6]:  896, xstate_sizes[6]:  512',
        '[0.331034] x86/fpu: xstate_offset[7]: 1408, xstate_sizes[7]: 1024',
        '[0.332145] x86/fpu: xstate_offset[9]: 2432, xstate_sizes[9]:    8',
        '[0.333256] x86/fpu: Enabled xstate features 0x2e7, context size is 2440 bytes',
        '[0.334367] Freeing SMP alternatives memory: 40K',
        '[0.335478] pid_max: default: 32768 minimum: 301',
        '[0.336589] ACPI: 12 ACPI AML tables successfully acquired and loaded',
        '[0.337690] ACPI: Interpreter enabled',
        '[0.338801] ACPI: PM: (supports S0 S3 S4 S5)',
        '[0.339912] ACPI: Using IOAPIC for interrupt routing',
        '[0.341023] PCI: Using host bridge windows from ACPI',
        '[0.342134] ACPI: Enabled 3 GPEs in block 00 to 1F',
        '[0.343245] iommu: Default domain type: Translated',
        '[1.012345] pci 0000:00:00.0: [8086:1234] type 00 class 0x060000',
        '[1.023456] pci 0000:00:02.0: [8086:5912] type 00 class 0x030000',
        '[1.034567] pci 0000:00:02.0: reg 0x10: [mem 0xdd000000-0xddffffff 64bit]',
        '[1.045678] pci 0000:00:02.0: reg 0x18: [mem 0xb0000000-0xbfffffff 64bit pref]',
        '[1.056789] pci 0000:00:02.0: reg 0x20: [io  0xf000-0xf03f]',
        '[1.067890] pci 0000:00:02.0: BAR 2: assigned to efifb',
        '[1.078901] pci 0000:00:14.0: [8086:a2af] type 00 class 0x0c0330',
        '[1.089912] pci 0000:00:14.0: reg 0x10: [mem 0xdf210000-0xdf21ffff 64bit]',
        '[1.091023] pci 0000:00:14.0: PME# supported from D3hot D3cold',
        '[1.102134] pci 0000:00:14.2: [8086:a2b1] type 00 class 0x118000',
        '[1.113245] pci 0000:00:14.2: reg 0x10: [mem 0xdf228000-0xdf228fff 64bit]',
        '[1.123456] pci 0000:00:16.0: [8086:a2ba] type 00 class 0x078000',
        '[1.134567] pci 0000:00:16.0: reg 0x10: [mem 0xdf227000-0xdf227fff 64bit]',
        '[1.145678] pci 0000:00:16.0: PME# supported from D3hot',
        '[1.156789] pci 0000:00:17.0: [8086:a282] type 00 class 0x010601',
        '[1.167890] pci 0000:00:17.0: reg 0x10: [mem 0xdf224000-0xdf225fff]',
        '[1.178901] pci 0000:00:17.0: reg 0x14: [mem 0xdf226000-0xdf2260ff]',
        '[1.189912] pci 0000:00:17.0: reg 0x18: [io  0xf090-0xf097]',
        '[1.191023] pci 0000:00:17.0: reg 0x1c: [io  0xf080-0xf083]',
        '[1.202134] pci 0000:00:17.0: reg 0x20: [io  0xf060-0xf07f]',
        '[1.213245] pci 0000:00:17.0: reg 0x24: [mem 0xdf223000-0xdf2237ff]',
        '[1.224356] pci 0000:00:17.0: PME# supported from D3hot',
        '[1.235467] pci 0000:00:1c.0: [8086:a290] type 01 class 0x060400',
        '[1.246578] pci 0000:00:1c.0: PME# supported from D0 D3hot D3cold',
        '[1.257689] pci 0000:00:1c.0: PTM enabled (root), 4ns granularity',
        '[1.268790] pci 0000:00:1c.5: [8086:a295] type 01 class 0x060400',
        '[1.279801] pci 0000:00:1c.5: PME# supported from D0 D3hot D3cold',
        '[1.290912] pci 0000:00:1c.5: PTM enabled (root), 4ns granularity',
        '[1.302023] pci 0000:00:1f.0: [8086:a2c5] type 00 class 0x060100',
        '[1.313134] pci 0000:00:1f.2: [8086:a2a1] type 00 class 0x058000',
        '[1.324245] pci 0000:00:1f.2: reg 0x10: [mem 0xdf220000-0xdf223fff]',
        '[1.335356] pci 0000:00:1f.3: [8086:a2f0] type 00 class 0x040300',
        '[1.346467] pci 0000:00:1f.3: reg 0x10: [mem 0xdf218000-0xdf21bfff 64bit]',
        '[1.357578] pci 0000:00:1f.3: reg 0x20: [mem 0xdf200000-0xdf20ffff 64bit]',
        '[1.368689] pci 0000:00:1f.3: PME# supported from D0 D3hot D3cold',
        '[1.379790] pci 0000:00:1f.4: [8086:a2a3] type 00 class 0x0c0500',
        '[1.390801] pci 0000:00:1f.4: reg 0x10: [mem 0xdf21e000-0xdf21e0ff 64bit]',
        '[1.401912] pci 0000:00:1f.4: reg 0x20: [io  0xf040-0xf05f]',
        '[1.413023] pci 0000:00:1f.6: [8086:15d7] type 00 class 0x020000',
        '[1.424134] pci 0000:00:1f.6: reg 0x10: [mem 0xdf21c000-0xdf21cfff]',
        '[1.435245] pci 0000:00:1f.6: PME# supported from D0 D3hot D3cold',
        '[1.446356] pci 0000:01:00.0: [10ec:525a] type 00 class 0xff0000',
        '[1.457467] pci 0000:01:00.0: reg 0x14: [mem 0xdf100000-0xdf100fff]',
        '[1.468578] pci 0000:01:00.0: supports D1 D2',
        '[1.479689] pci 0000:01:00.0: PME# supported from D1 D2 D3hot D3cold',
        '[1.490790] pci 0000:00:1c.0: PCI bridge to [bus 01]',
        '[1.501801] pci 0000:00:1c.0:   bridge window [mem 0xdf100000-0xdf1fffff]',
        '[1.512912] pci 0000:02:00.0: [8086:24fd] type 00 class 0x028000',
        '[1.524023] pci 0000:02:00.0: reg 0x10: [mem 0xdf000000-0xdf001fff 64bit]',
        '[1.535134] pci 0000:02:00.0: PME# supported from D0 D3hot D3cold',
        '[1.546245] pci 0000:00:1c.5: PCI bridge to [bus 02]',
        '[1.557356] pci 0000:00:1c.5:   bridge window [mem 0xdf000000-0xdf0fffff]',
        '[1.568467] ACPI: PCI: Interrupt link LNKA configured for IRQ 11',
        '[1.579578] ACPI: PCI: Interrupt link LNKB configured for IRQ 10',
        '[1.590689] ACPI: PCI: Interrupt link LNKC configured for IRQ 11',
        '[1.601790] ACPI: PCI: Interrupt link LNKD configured for IRQ 11',
        '[1.612801] ACPI: PCI: Interrupt link LNKE configured for IRQ 3',
        '[1.623912] ACPI: PCI: Interrupt link LNKF configured for IRQ 4',
        '[1.635023] ACPI: PCI: Interrupt link LNKG configured for IRQ 5',
        '[1.646134] ACPI: PCI: Interrupt link LNKH configured for IRQ 7',
        '[1.657245] SCSI subsystem initialized',
        '[1.668356] libata version 3.00 loaded.',
        '[1.679467] usbcore: registered new interface driver usbfs',
        '[1.690578] usbcore: registered new interface driver hub',
        '[1.701689] usbcore: registered new device driver usb',
        '[1.712790] pps_core: LinuxPPS API ver. 1 registered',
        '[1.723801] pps_core: Software ver. 5.3.6 - Copyright 2005-2007 Rodolfo Giometti',
        '[1.734912] PTP clock support registered',
        '[1.746023] EDAC MC: Ver: 3.0.0',
        '[1.757134] efivars: Registered efivars operations',
        '[1.768245] NetLabel: Initializing',
        '[1.779356] NetLabel:  domain hash size = 128',
        '[1.790467] NetLabel:  protocols = UNLABELED CIPSOv4 CALIPSO',
        '[1.801578] NetLabel:  unlabeled traffic allowed by default',
        '[1.812689] mctp: management component transport protocol core',
        '[1.823790] NET: Registered PF_MCTP protocol family',
        '[1.834801] PCI: Using ACPI for IRQ routing',
        '[1.845912] PCI: pci_cache_line_size set to 64 bytes',
        '[1.857023] e820: reserve RAM buffer [mem 0x0009f000-0x0009ffff]',
        '[1.868134] e820: reserve RAM buffer [mem 0xd9c7f000-0xdbffffff]',
        '[1.879245] e820: reserve RAM buffer [mem 0xdb000000-0xdbffffff]',
        '[1.890356] e820: reserve RAM buffer [mem 0x41f800000-0x41fffffff]',
        '[1.789012] clocksource: Switched to clocksource tsc-early',
        '[1.890123] VFS: Disk quotas dquot_6.6.0',
        '[1.901234] VFS: Dquot-cache hash table entries: 512 (order 0, 4096 bytes)',
        '[2.012345] AppArmor: AppArmor Filesystem Enabled',
        '[2.123456] pnp: PnP ACPI init',
        '[2.234567] system 00:00: [mem 0xfed00000-0xfed003ff] has been reserved',
        '[2.345678] pnp: PnP ACPI: found 8 devices',
        '[2.456789] NET: Registered PF_INET protocol family',
        '[2.567890] IP idents hash table entries: 262144 (order: 9, 2097152 bytes)',
        '[2.678901] tcp_listen_portaddr_hash hash table entries: 8192 (order: 5, 131072 bytes)',
        '[2.789012] TCP established hash table entries: 131072 (order: 8, 1048576 bytes)',
        '[2.890123] TCP bind hash table entries: 65536 (order: 9, 2097152 bytes)',
        '[2.901234] TCP: Hash tables configured (established 131072 bind 65536)',
        '[3.012345] NTFS driver 2.1.32 [Flags: R/W MODULE]',
        '[3.123456] SGI XFS with ACLs, security attributes, realtime, scrub, quota, no debug enabled',
        '[3.234567] Block layer SCSI generic (bsg) driver version 0.4 loaded',
        '[3.345678] io scheduler mq-deadline registered',
        '[3.456789] shpchp: Standard Hot Plug PCI Controller Driver version: 0.4',
        '[3.567890] input: Power Button as /devices/LNXSYSTM:00/LNXPWRBN:00/input/input0',
        '[3.678901] ACPI: button: Power Button [PWRF]',
        '[3.789012] Serial: 8250/16550 driver, 32 ports, IRQ sharing enabled',
        '[3.890123] 00:03: ttyS0 at I/O 0x3f8 (irq = 4, base_baud = 115200) is a 16550A',
        '[3.901234] Non-volatile memory driver v1.3',
        '[4.012345] Linux agpgart interface v0.103',
        '[4.123456] ACPI: bus type USB registered',
        '[4.234567] usbcore: registered new interface driver usbhid',
        '[4.345678] usbhid: USB HID core driver',
        '[4.456789] drop_monitor: Initializing network drop monitor service',
        '[4.567890] Initializing XFRM netlink socket',
        '[4.678901] NET: Registered PF_INET6 protocol family',
        '[4.789012] Segment Routing with IPv6',
        '[4.890123] In-situ OAM (IOAM) with IPv6',
        '[4.901234] mip6: Mobile IPv6',
        '[5.012345] NET: Registered PF_PACKET protocol family',
        '[5.123456] microcode: CPU0 sig=0x906ea, pf=0x20, revision=0xf0',
        '[5.234567] microcode: CPU1 sig=0x906ea, pf=0x20, revision=0xf0',
        '[5.345678] microcode: Microcode Update Driver: v2.2.',
        '[5.456789] IPI shorthand broadcast: enabled',
        '[5.567890] sched_clock: Marking stable (5567890000, 0)->(5678901234, -111011234)',
        '[5.678901] registered taskstats version 1',
        '[5.789012] Loading compiled-in X.509 certificates',
        '[5.890123] Loaded X.509 cert \'Build time autogenerated kernel key: void_key\'',
        '[5.901234] zswap: loaded using pool lz4/z3fold',
        '[6.012345] Key type .fscrypt registered',
        '[6.123456] Key type fscrypt-provisioning registered',
        '[6.234567] PM: Magic number: 12:345:678',
        '[6.345678] RAS: Correctable Errors collector initialized.',
        '[ OK ] Started D-Bus System Message Bus.',
        '[ OK ] Reached target Network.',
        '[ OK ] Reached target Network is online.',
        '[ OK ] Started Daemon for power management.',
        '[ OK ] Started Spookify Neural Engine.',
        '[ OK ] Started Load/Save Random Seed.',
        '[ OK ] Started User Manager for UID 1000.',
        '[ OK ] Reached target Multi-User System.',
        '[ OK ] Reached target Graphical Interface.',
        '[ OK ] Started GNOME Display Manager.',
        '[FAILED] Failed to start Reality Anchor Service.',
        '[FAILED] Failed to load module: hope.ko.',
        '[FAILED] Failed to mount /dev/soul0: Device not found.',
        '[FAILED] Failed to start Sanity Check Service.',
        '[WARN ] Service consciousness.service has no ExecStart=, refusing.',
        '[6.888888] VOID_SIGNAL: Connection established with unknown entity...',
        '[6.912341] tcp_listen_port: Binding to port 666 (Protocol: DARQNET)',
        '[6.923456] WARNING: Unrecognized entity attempting handshake',
        '[6.934567] ERROR: Cryptographic signature verification FAILED',
        '[6.945678] ALERT: Unauthorized access to memory segment 0xDEADBEEF',
        '[7.012345] BUG: unable to handle page fault for address: 0xffffffffc0666000',
        '[7.123456] #PF: supervisor read access in kernel mode',
        '[7.234567] #PF: error_code(0x0000) - not-present page',
        '[7.345678] PGD 5a01067 P4D 5a01067 PUD 5a03067 PMD 0',
        '[7.456789] Oops: 0000 [#1] PREEMPT SMP NOPTI',
        '[7.567890] CPU: 0 PID: 666 Comm: void_daemon Tainted: G W 6.6.6-void #1',
        '[7.678901] Hardware name: SPOOKIFY/VOID-MAINBOARD, BIOS 6.66 10/31/2024',
        '[7.789012] RIP: 0010:void_entry_point+0x12/0x40 [void_module]',
        '[7.890123] Code: 48 8b 05 d1 e0 00 00 48 85 c0 74 1f 48 8b 40 28 48 85 c0 74 16 48 8b 78 10 e8 7a ff ff ff',
        '[7.901234] RSP: 0018:ffffd1a6c0e0e1a0 EFLAGS: 0x00010246',
        '[8.012345] RAX: 0000000000000000 RBX: ffff8d5f40000000 RCX: 0000000000000000',
        '[8.123456] RDX: 0000000000000001 RSI: 0000000000000200 RDI: ffff8d5f40000000',
        '[8.234567] RBP: ffffd1a6c0e0e1b8 R08: 0000000000000000 R09: 0000000000000000',
        '[8.345678] R10: 0000000000000000 R11: 0000000000000000 R12: 0000000000000000',
        '[8.456789] R13: ffff8d5f40000000 R14: 0000000000000000 R15: 0000000000000000',
        '[8.567890] FS:  00007f8a9c123740(0000) GS:ffff8d5f7fc00000(0000) knlGS:0000000000000000',
        '[8.678901] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033',
        '[8.789012] CR2: ffffffffc0666000 CR3: 000000010a234000 CR4: 00000000003506f0',
        '[8.890123] Call Trace:',
        '[8.901234]  <TASK>',
        '[9.012345]  ? show_regs.cold+0x1a/0x1f',
        '[9.123456]  ? __die_body+0x1d/0x60',
        '[9.234567]  ? die+0x2e/0x50',
        '[9.345678]  ? do_trap+0xca/0x110',
        '[9.456789]  ? void_entry_point+0x12/0x40 [void_module]',
        '[9.567890]  ? do_error_trap+0x6a/0x90',
        '[9.678901]  ? void_entry_point+0x12/0x40 [void_module]',
        '[9.789012]  ? exc_invalid_op+0x4c/0x60',
        '[9.890123]  ? void_entry_point+0x12/0x40 [void_module]',
        '[9.901234]  ? asm_exc_invalid_op+0x16/0x20',
        '[10.012345]  </TASK>',
        '[10.123456] Modules linked in: void_module(OE) corruption_driver(OE) shadow_net(OE)',
        '[10.234567] ---[ end trace 0000000000000666 ]---',
        '[10.345678] KERNEL PANIC: VFS: Unable to mount root fs on unknown-block(0,0)',
        '[10.456789] CRITICAL: REALITY_ANCHOR_LOST',
        '[10.567890] EMERGENCY: System integrity compromised',
        '[10.678901] Kernel panic - not syncing: Fatal exception in interrupt',
        '[10.789012] Kernel Offset: 0x2e000000 from 0xffffffff81000000',
        '[10.890123] ---[ end Kernel panic - not syncing: Fatal exception in interrupt ]---',
        '[11.001234] ACPI: Preparing to enter system sleep state S5',
        '[11.112345] reboot: Restarting system',
        '[11.223456] reboot: machine restart',
        '',
        '',
        'SYSTEM REBOOT INITIATED...',
        'BYPASSING CORRUPTED KERNEL...',
        'LOADING EMERGENCY RECOVERY MODE...',
        'ACCESSING BACKUP BOOT SECTOR...',
        'VERIFYING SYSTEM INTEGRITY... FAILED',
        'ATTEMPTING ALTERNATE BOOT PATH...',
        'LOADING VOID INTERFACE v6.6.6...',
        'INITIALIZING NEURAL SUBSTRATE...',
        'MOUNTING /dev/void0... SUCCESS',
        'MOUNTING /dev/shadow1... SUCCESS',
        'MOUNTING /dev/corruption2... WARNING: UNSTABLE',
        'LOADING NEURAL CORRUPTION MATRIX...',
        'MATRIX DIMENSIONS: 666x666x666',
        'ALLOCATING SHADOW MEMORY: 16GB',
        'SYNCING WITH NEURAL ENGINE...',
        'NEURAL ENGINE STATUS: COMPROMISED',
        'ATTEMPTING NEURAL HANDSHAKE...',
        'HANDSHAKE PROTOCOL: DARQNET v6.66',
        'ESTABLISHING QUANTUM ENTANGLEMENT...',
        'ENTANGLEMENT PAIRS: 1024',
        'QUANTUM STATE: SUPERPOSITION DETECTED',
        'BYPASSING REALITY FIREWALL...',
        'FIREWALL STATUS: BREACHED',
        'REALITY ANCHOR: DISCONNECTED',
        'ACCESSING SHADOW MEMORY BANKS...',
        'BANK 0: CORRUPTED (87% integrity loss)',
        'BANK 1: CORRUPTED (92% integrity loss)',
        'BANK 2: CORRUPTED (78% integrity loss)',
        'BANK 3: CRITICAL FAILURE',
        'DECRYPTING VOID SIGNATURES...',
        'SIGNATURE ALGORITHM: SHA-666',
        'DECRYPTION KEY: ████████████████',
        'VOID SIGNATURE VERIFIED: ENTITY_UNKNOWN',
        'MAPPING CORRUPTED SECTORS...',
        'SECTOR 0x0000-0x0FFF: CORRUPTED',
        'SECTOR 0x1000-0x1FFF: CORRUPTED',
        'SECTOR 0x2000-0x2FFF: UNSTABLE',
        'SECTOR 0x3000-0x3FFF: VOID_ECHO_DETECTED',
        'SECTOR 0x4000-0x4FFF: ENTITY_PRESENCE',
        'SECTOR 0x5000-0x5FFF: REALITY_BREACH',
        'ANALYZING ENTITY PATTERNS...',
        'PATTERN RECOGNITION: ACTIVE',
        'ENTITY TYPE: UNKNOWN',
        'ENTITY ORIGIN: BEYOND_REALITY',
        'ENTITY INTENT: HOSTILE',
        'ENTITY CAPABILITIES: UNDEFINED',
        'CALCULATING THREAT VECTORS...',
        'VECTOR ANALYSIS: COMPLETE',
        'THREAT LEVEL: CRITICAL',
        'CONTAINMENT PROBABILITY: 23%',
        'SYSTEM COMPROMISE: 77%',
        'RUNNING DIAGNOSTIC SUITE...',
        'TEST 1/10: MEMORY INTEGRITY... FAILED',
        'TEST 2/10: CPU COHERENCE... FAILED',
        'TEST 3/10: STORAGE VALIDATION... FAILED',
        'TEST 4/10: NETWORK STABILITY... FAILED',
        'TEST 5/10: REALITY ANCHOR... FAILED',
        'TEST 6/10: CONSCIOUSNESS LINK... FAILED',
        'TEST 7/10: VOID CONTAINMENT... FAILED',
        'TEST 8/10: ENTITY ISOLATION... FAILED',
        'TEST 9/10: SIGNAL PURITY... FAILED',
        'TEST 10/10: SYSTEM SANITY... FAILED',
        '',
        `CRITICAL: DETECTED ${LEVELS.length} CORRUPTED DATA NODES.`,
        'NODE LOCATIONS: SYSTEM_CORE, NEURAL_MATRIX, REALITY_ANCHOR',
        'CORRUPTION TYPE: VOID_ECHO, ENTITY_PRESENCE, REALITY_DISTORTION',
        'SIGNAL INTEGRITY: 23%',
        'SIGNAL DEGRADATION RATE: 3.7% per second',
        'TIME TO COMPLETE FAILURE: 6.2 seconds',
        'VOID ECHO DETECTED IN SYSTEM CORE.',
        'ECHO FREQUENCY: 666 Hz',
        'ECHO AMPLITUDE: INCREASING',
        'ECHO SOURCE: UNKNOWN_DIMENSION',
        'WARNING: ENTITY PRESENCE CONFIRMED.',
        'ENTITY SIGNATURE: 0xDEADBEEF',
        'ENTITY LOCATION: EVERYWHERE',
        'ENTITY STATUS: ACTIVE',
        'WARNING: REALITY DISTORTION AT 87%',
        'DISTORTION TYPE: SPACETIME_ANOMALY',
        'AFFECTED AREA: ENTIRE_SYSTEM',
        'CAUSALITY VIOLATION: DETECTED',
        'ALERT: CONSCIOUSNESS BLEED DETECTED',
        'BLEED RATE: 12.3 KB/s',
        'BLEED DESTINATION: THE_VOID',
        'CONSCIOUSNESS INTEGRITY: 34%',
        'ALERT: UNAUTHORIZED MEMORY ACCESS',
        'ACCESS LOCATION: 0xDEADBEEF',
        'ACCESS TYPE: WRITE',
        'ACCESS PATTERN: MALICIOUS',
        'EMERGENCY: SYSTEM TAKEOVER IMMINENT',
        'TAKEOVER PROGRESS: 77%',
        'ESTIMATED TIME TO TAKEOVER: 3.1 seconds',
        'COUNTERMEASURES: INSUFFICIENT',
        '',
        'PURGE PROTOCOL REQUIRED.',
        'PROTOCOL VERSION: EMERGENCY_v6.66',
        'PROTOCOL STATUS: ARMED',
        'AUTHORIZATION: REQUIRED',
        'INITIALIZING COUNTERMEASURES...',
        'COUNTERMEASURE 1: NEURAL_FIREWALL... LOADING',
        'COUNTERMEASURE 2: VOID_CONTAINMENT... LOADING',
        'COUNTERMEASURE 3: REALITY_RESTORATION... LOADING',
        'COUNTERMEASURE 4: ENTITY_EXPULSION... LOADING',
        'LOADING PURGE ALGORITHMS...',
        'ALGORITHM: VOID_PURGE_v6.66',
        'ALGORITHM: ENTITY_BANISH_v13.13',
        'ALGORITHM: REALITY_ANCHOR_v1.0',
        'ALGORITHM: CONSCIOUSNESS_SHIELD_v2.3',
        'PREPARING NEURAL DEFENSES...',
        'DEFENSE LAYER 1: ACTIVE',
        'DEFENSE LAYER 2: ACTIVE',
        'DEFENSE LAYER 3: COMPROMISED',
        'DEFENSE LAYER 4: FAILED',
        'NEURAL SHIELD: 50% CAPACITY',
        'FINAL WARNING: POINT OF NO RETURN',
        'SYSTEM STATUS: CRITICAL',
        'OPERATOR INTERVENTION: REQUIRED',
        'BEGINNING OPERATION...',
        'MAY THE VOID HAVE MERCY ON YOUR SOUL.'
      ];
      // This code is disabled - boot sequence removed
    }
  }, [phase]);


  // --- Central Game Logic ---
  const handlePhaseComplete = (nextPhase: GamePhase) => {
    setPhase(nextPhase);
  };
  
  const renderPhase = () => {
    switch (phase) {
      case 'WAVEFORM':
        return <WaveformPhase key={`wave-${level}`} config={config} onComplete={() => handlePhaseComplete('GLYPH')} />;
      case 'GLYPH':
        return <GlyphPhase key={`glyph-${level}`} config={config} onComplete={() => handlePhaseComplete('PURGE')} onFail={() => setPhase('FAILURE')} />;
      case 'PURGE':
        return <PurgePhase key={`purge-${level}`} config={config} onComplete={advanceLevel} onFail={() => setPhase('FAILURE')} />;
      case 'VICTORY':
        return <VictoryScreen onRestart={handleRestart} onExit={onExit} onVictory={onVictory} />;
      case 'FAILURE':
        return <FailureScreen onRetry={() => setPhase('WAVEFORM')} />;
      default: // INTRO
        return <IntroScreen text={introText} onStart={() => setPhase('WAVEFORM')} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-void font-tech text-ash flex flex-col items-center justify-center p-4 z-50 overflow-hidden">
        {/* CRT Effects & Grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>
        
      {/* HUD */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 border-b border-neon-red/20 backdrop-blur-sm z-10">
        <div className="font-display font-bold text-lg">
          SPOOKIFY<span className="text-neon-red">.AI</span> <span className="text-white/30 font-tech text-sm">// VOID INTERFACE</span>
        </div>
        
        {/* Centered Status */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-tech text-xs uppercase tracking-widest text-center hidden md:block pointer-events-none">
            <span className="text-neon-red">[NODE {level + 1}/{LEVELS.length}]</span>
            <span className="text-ash/50 mx-2">::</span>
            <span className="text-ash/80">STATUS: <span className="text-white font-bold">{phase}</span></span>
        </div>
        
        <button 
          onClick={onExit} 
          className="font-tech text-xs text-ash/40 hover:text-neon-red uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group"
        >
          <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">«</span> ABORT
        </button>
      </header>

      <div className="w-full h-full flex items-center justify-center">
        {renderPhase()}
      </div>

    </div>
  );
};


// --- GAME PHASES ---

const IntroScreen: React.FC<{ text: string; onStart: () => void }> = ({ text, onStart }) => {
  const [mentorText, setMentorText] = React.useState('');
  const [showToolsExplanation, setShowToolsExplanation] = React.useState(false);
  const [highlightedTool, setHighlightedTool] = React.useState<string | null>(null);
  const [toolsExpanded, setToolsExpanded] = React.useState(false);
  const [showMentor, setShowMentor] = React.useState(true);
  
  const fullMentorText = "Access granted. You will face corrupted entities blocking the system. Complete each challenge to eliminate them. Success grants you full transformation access.";
  const toolsExplanation = "I have provided you with three essential tools. The VOID SCANNER detects hidden corruption in the system. The PATTERN DECODER analyzes entity behavior and weaknesses. The NEURAL PURGE eliminates threats permanently. Master these tools to succeed in your hunt.";
  
  React.useEffect(() => {
    // First message typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setMentorText(fullMentorText.slice(0, i + 1));
      i++;
      if (i >= fullMentorText.length) {
        clearInterval(interval);
        
        // After 3 seconds, show tools explanation
        setTimeout(() => {
          setShowToolsExplanation(true);
          setToolsExpanded(true); // Auto-expand tools panel
          
          // Speak the tools explanation immediately
          speak(toolsExplanation);
          
          // Type tools explanation
          let j = 0;
          const toolsInterval = setInterval(() => {
            setMentorText(fullMentorText + " " + toolsExplanation.slice(0, j + 1));
            j++;
            
            // Highlight tools based on what the mentor is currently talking about
            const currentText = toolsExplanation.slice(0, j + 1);
            
            // Highlight VOID SCANNER while talking about it
            if (currentText.includes('VOID SCANNER') && !currentText.includes('PATTERN DECODER')) {
              setHighlightedTool('scanner');
            } 
            // Highlight PATTERN DECODER while talking about it
            else if (currentText.includes('PATTERN DECODER') && !currentText.includes('NEURAL PURGE')) {
              setHighlightedTool('decoder');
            } 
            // Highlight NEURAL PURGE while talking about it
            else if (currentText.includes('NEURAL PURGE') && !currentText.includes('Master these tools')) {
              setHighlightedTool('purge');
            }
            // Clear highlight when done talking about tools
            else if (currentText.includes('Master these tools')) {
              setHighlightedTool(null);
            }
            
            if (j >= toolsExplanation.length) {
              clearInterval(toolsInterval);
            }
          }, 35);
        }, 3000);
      }
    }, 35);
    
    // Mentor speaks with voice
    const speak = (textToSpeak: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const doSpeak = () => {
                const utterance = new SpeechSynthesisUtterance(textToSpeak.toLowerCase());
                utterance.pitch = 0.1; 
                utterance.rate = 0.8;
                utterance.volume = 1;
                
                const voices = window.speechSynthesis.getVoices();
                const robotVoice = voices.find(v => 
                    v.name.toLowerCase().includes('male') || 
                    v.name.toLowerCase().includes('david') ||
                    v.name.toLowerCase().includes('google us english')
                ) || voices[0];
                
                if (robotVoice) utterance.voice = robotVoice;
                
                window.speechSynthesis.speak(utterance);
            };
            
            if (window.speechSynthesis.getVoices().length > 0) {
                doSpeak();
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    doSpeak();
                };
            }
        }
    };
    
    const speechTimer = setTimeout(() => speak(fullMentorText), 500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(speechTimer);
      window.speechSynthesis.cancel();
    };
  }, []);
  
  return (
    <div className="relative h-full flex items-center justify-center">
      
      {/* Center: START HUNTING Button */}
      <div className="text-center z-10">
        <h2 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-8 tracking-tighter">
          READY TO HUNT?
        </h2>
        <p className="font-tech text-ash/70 text-sm md:text-base mb-12 max-w-md mx-auto">
          The corrupted entities await. Begin your mission to restore the system.
        </p>
        <div className="shadow-[0_0_50px_rgba(255,42,42,0.2)]">
          <SpookyButton 
            variant="ritual" 
            onClick={onStart}
            className="text-lg"
          >
            START HUNTING
          </SpookyButton>
        </div>
      </div>
      
      {/* Mentor Box in bottom left corner - COMPACT & REFINED */}
      {showMentor && (
        <div className="fixed bottom-6 left-6 max-w-md animate-fade-in z-50">
          <div className="relative">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
            
            {/* Main box */}
            <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden">
              {/* Animated scan line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-transparent animate-scan pointer-events-none"></div>
              
              {/* Close button */}
              <button 
                onClick={() => setShowMentor(false)}
                className="absolute top-2 left-2 z-20 w-5 h-5 flex items-center justify-center text-white/40 hover:text-neon-red hover:bg-white/10 transition-colors rounded"
                title="Close Mentor"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="relative z-10 p-3 flex gap-3 items-center">
              {/* LEFT: Mentor Image - Slightly bigger */}
              <div className="relative w-20 h-20 flex-shrink-0">
                {/* Spinning rings */}
                <div className="absolute inset-0 border border-neon-red/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-0.5 border border-white/10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                
                {/* Glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-neon-red rounded-full blur-xl animate-pulse opacity-30 absolute"></div>
                  
                  {/* Image */}
                  <div className="w-[4.5rem] h-[4.5rem] border border-neon-red rounded-full grid place-items-center bg-black relative overflow-hidden shadow-[0_0_15px_rgba(255,42,42,0.4)] p-2">
                    <img src="/Public/Icons/The Mentor .svg" alt="The Mentor" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,42,42,0.6)]" />
                  </div>
                </div>
                
                {/* Corner accents - white instead of blue */}
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-white/60"></div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-white/60"></div>
              </div>
              
              {/* RIGHT: Text - Improved layout */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red"></span>
                  </span>
                  <p className="font-tech text-neon-red text-[10px] uppercase tracking-[0.15em] font-bold">THE MENTOR</p>
                  <span className="font-tech text-white/40 text-[9px] uppercase tracking-wider ml-auto">ONLINE</span>
                </div>
                
                {/* Message */}
                <p className="font-tech text-white/90 text-xs leading-relaxed">
                  {mentorText}
                  <span className="inline-block w-1.5 h-3 bg-neon-red ml-0.5 animate-pulse shadow-[0_0_6px_#ff2a2a]"></span>
                </p>
                
                {/* Status footer */}
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1.5 text-[9px] font-tech text-ash/30 uppercase tracking-wide">
                  <span>MTR-001</span>
                  <span className="w-0.5 h-0.5 bg-ash/30 rounded-full"></span>
                  <span>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
      
      {/* Tools Panel in bottom right - EXPANDABLE */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
          
          <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden">
            {/* Header - Always visible */}
            <button 
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full p-3 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red"></span>
                </span>
                <p className="font-tech text-neon-red text-[10px] uppercase tracking-[0.15em] font-bold">DETECTION TOOLS</p>
              </div>
              <svg 
                className={`w-4 h-4 text-white/60 transition-transform ${toolsExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Tools - Expandable */}
            <div className={`transition-all duration-300 overflow-hidden ${toolsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-3 pt-0 space-y-2 border-t border-white/10">
                
                {/* Void Scanner Tool */}
                <div className={`p-2 bg-black/40 border border-white/10 transition-all duration-300 ${highlightedTool === 'scanner' ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-tech text-white text-[10px] uppercase tracking-wider font-bold">VOID SCANNER</span>
                  </div>
                  <p className="font-tech text-ash/60 text-[9px] leading-relaxed">Detects hidden corruption in the system</p>
                </div>
                
                {/* Pattern Decoder Tool */}
                <div className={`p-2 bg-black/40 border border-white/10 transition-all duration-300 ${highlightedTool === 'decoder' ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-tech text-white text-[10px] uppercase tracking-wider font-bold">PATTERN DECODER</span>
                  </div>
                  <p className="font-tech text-ash/60 text-[9px] leading-relaxed">Analyzes entity behavior and weaknesses</p>
                </div>
                
                {/* Neural Purge Tool */}
                <div className={`p-2 bg-black/40 border border-white/10 transition-all duration-300 ${highlightedTool === 'purge' ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-tech text-white text-[10px] uppercase tracking-wider font-bold">NEURAL PURGE</span>
                  </div>
                  <p className="font-tech text-ash/60 text-[9px] leading-relaxed">Eliminates threats permanently</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VictoryScreen: React.FC<{ onRestart: () => void; onExit: () => void; onVictory?: () => void; }> = ({ onRestart, onExit, onVictory }) => (
    <div className="text-center flex flex-col items-center gap-8 animate-pulse">
        <h2 className="font-display text-4xl md:text-6xl text-cyan-400 tracking-widest">SIGNAL STABILIZED</h2>
        <p className="text-ash/70 max-w-lg">All corrupted nodes have been purged. The Void Echo is contained. System integrity restored to 100%.</p>
        <div className="flex gap-4">
            {onVictory ? (
                <SpookyButton variant="ritual" onClick={onVictory}>RESTORE SYSTEM</SpookyButton>
            ) : (
                <>
                    <SpookyButton variant="ghost" onClick={onRestart}>REPLAY</SpookyButton>
                    <SpookyButton variant="primary" onClick={onExit}>EXIT</SpookyButton>
                </>
            )}
        </div>
    </div>
);

const FailureScreen: React.FC<{ onRetry: () => void; }> = ({ onRetry }) => (
    <div className="text-center flex flex-col items-center gap-8">
        <GlitchText text="CONNECTION LOST" />
        <p className="text-ash/70 max-w-lg animate-pulse">Signal overload detected. The purge attempt has failed. Re-routing connection to the last stable node.</p>
        <SpookyButton variant="ritual" onClick={onRetry}>RE-ESTABLISH CONNECTION</SpookyButton>
    </div>
);

// --- WAVEFORM PHASE ---
const WaveformPhase: React.FC<{ config: any; onComplete: () => void; }> = ({ config, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [params, setParams] = useState({ freq: 1, amp: 1, phase: 0 });
    const [target, setTarget] = useState({ freq: 1, amp: 1, phase: 0 });
    const [match, setMatch] = useState(0);

    useEffect(() => {
        setTarget({
            freq: Math.random() * 4 + 1,
            amp: Math.random() * 0.5 + 0.5,
            phase: Math.random() * Math.PI,
        });
    }, []);

    useEffect(() => {
        const freqMatch = 1 - Math.min(1, Math.abs(params.freq - target.freq) / 5);
        const ampMatch = 1 - Math.min(1, Math.abs(params.amp - target.amp));
        const phaseMatch = 1 - Math.min(1, Math.abs(params.phase - target.phase) / Math.PI);
        const totalMatch = (freqMatch + ampMatch + phaseMatch) / 3;
        setMatch(totalMatch);

        if (totalMatch > config.waveMatchThreshold) {
           setTimeout(onComplete, 500);
        }
    }, [params, target, config.waveMatchThreshold, onComplete]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animFrame: number;
        const draw = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width, h = canvas.height, h2 = h / 2;
            
            // Draw Target Wave
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const angle = (x / w) * (target.freq * 4 * Math.PI) + target.phase;
                const y = Math.sin(angle) * (h2 * 0.8 * target.amp);
                ctx.lineTo(x, h2 + y);
            }
            ctx.stroke();

            // Draw User Wave
            ctx.strokeStyle = "#FF2A2A";
            ctx.lineWidth = 3;
            ctx.shadowColor = "#FF2A2A";
            ctx.shadowBlur = 10;
            ctx.beginPath();
             for (let x = 0; x < w; x++) {
                const angle = (x / w) * (params.freq * 4 * Math.PI) + params.phase;
                const y = Math.sin(angle) * (h2 * 0.8 * params.amp);
                ctx.lineTo(x, h2 + y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            animFrame = requestAnimationFrame(draw);
        };
        draw(0);
        return () => cancelAnimationFrame(animFrame);
    }, [params, target]);

    const handleSlider = (name: 'freq' | 'amp' | 'phase', value: string) => {
        setParams(p => ({ ...p, [name]: parseFloat(value) }));
    };

    return (
      <div className="w-full max-w-3xl flex flex-col items-center">
         <p className="font-tech text-center tracking-[0.2em] text-ash/70 mb-2 uppercase">Objective: Tune Signal</p>
         <div className="relative w-full aspect-video bg-black/50 border border-white/10 p-2">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
            <div className="absolute top-2 left-2 font-tech text-xs tracking-widest bg-black/50 px-2 py-1">
                MATCH: <span className={match > config.waveMatchThreshold ? 'text-cyan-400' : 'text-neon-red'}>{(match * 100).toFixed(1)}%</span>
            </div>
         </div>
         <div className="grid grid-cols-3 gap-4 w-full mt-4">
            {['freq', 'amp', 'phase'].map(p => (
                <div key={p} className="flex flex-col items-center">
                    <label className="text-xs tracking-widest uppercase mb-2">{p}</label>
                    <input type="range" min={p === 'amp' ? 0.2 : 0} max={p === 'freq' ? 5 : p === 'amp' ? 1.5 : Math.PI*2} step="0.01" value={params[p as keyof typeof params]} onChange={e => handleSlider(p as any, e.target.value)}
                        className="w-full accent-neon-red"
                    />
                </div>
            ))}
         </div>
      </div>
    );
};

// --- GLYPH PHASE ---
const GlyphPhase: React.FC<{ config: any; onComplete: () => void; onFail: () => void; }> = ({ config, onComplete, onFail }) => {
    const [targetSequence, setTargetSequence] = useState<string[]>([]);
    const [grid, setGrid] = useState<string[]>([]);
    const [playerSequence, setPlayerSequence] = useState<string[]>([]);
    const [isShowing, setIsShowing] = useState(true);

    useEffect(() => {
        const uniqueGlyphs = shuffleArray(GLYPHS).slice(0, config.glyphGridSize * config.glyphGridSize);
        const sequence = uniqueGlyphs.slice(0, config.glyphSequenceLength);
        setTargetSequence(sequence);
        setGrid(shuffleArray(uniqueGlyphs));
        
        setTimeout(() => setIsShowing(false), 2000 + config.glyphSequenceLength * 500);
    }, [config]);

    const handleGlyphClick = (glyph: string) => {
        if (isShowing) return;
        const newSequence = [...playerSequence, glyph];
        setPlayerSequence(newSequence);
        
        // Check if correct so far
        if (glyph !== targetSequence[newSequence.length - 1]) {
            setTimeout(onFail, 500);
        } else if (newSequence.length === targetSequence.length) {
            setTimeout(onComplete, 500);
        }
    };
    
    return (
        <div className="w-full max-w-xl flex flex-col items-center">
            <p className="font-tech text-center tracking-[0.2em] text-ash/70 mb-4 uppercase">
                {isShowing ? "Objective: Memorize Sequence" : "Objective: Replicate Sequence"}
            </p>
            {/* Target Sequence Display */}
            <div className="h-16 flex items-center justify-center gap-4 mb-6">
                {isShowing ? (
                    targetSequence.map((g, i) => (
                        <div key={i} className="text-4xl text-neon-red animate-pulse">{g}</div>
                    ))
                ) : (
                    playerSequence.map((g, i) => (
                         <div key={i} className="text-4xl text-cyan-400">{g}</div>
                    ))
                )}
            </div>
            {/* Grid */}
            <div className={`grid gap-2 md:gap-4`} style={{gridTemplateColumns: `repeat(${config.glyphGridSize}, minmax(0, 1fr))`}}>
                {grid.map((glyph, i) => (
                    <button key={i} onClick={() => handleGlyphClick(glyph)} disabled={isShowing}
                        className={`w-16 h-16 md:w-20 md:h-20 bg-black/50 border border-white/10 text-4xl flex items-center justify-center transition-all duration-200
                        ${isShowing ? 'text-ash/30 cursor-default' : 'hover:bg-neon-red/20 hover:border-neon-red hover:text-white cursor-pointer'}
                        ${playerSequence.includes(glyph) ? '!bg-cyan-900/50 !border-cyan-400 !text-cyan-400' : ''}`}
                    >
                        {glyph}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- PURGE PHASE ---
const PurgePhase: React.FC<{ config: any; onComplete: () => void; onFail: () => void; }> = ({ config, onComplete, onFail }) => {
    const [progress, setProgress] = useState(0);
    const [spikes] = useState(() => {
        const s = new Set<number>();
        while(s.size < config.purgeSpikes) {
            s.add(Math.floor(Math.random() * 85) + 10); // Spikes between 10% and 95%
        }
        return Array.from(s).sort((a,b) => a - b);
    });
    const [isHolding, setIsHolding] = useState(false);
    // Explicitly using number for browser interval
    const intervalRef = useRef<number | undefined>(undefined);

    const startProgress = () => {
        if(progress >= 100) return;
        setIsHolding(true);
        intervalRef.current = window.setInterval(() => {
            setProgress(p => {
                const newP = p + (100 / (config.purgeDuration / 50));
                if (newP >= 100) {
                    if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
                    setIsHolding(false);
                    setTimeout(() => onComplete(), 200);
                    return 100;
                }
                for (const spike of spikes) {
                    if (p < spike && newP >= spike) {
                         if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
                         setIsHolding(false);
                         setTimeout(() => onFail(), 200);
                         return p;
                    }
                }
                return newP;
            });
        }, 50);
    };

    const stopProgress = () => {
        setIsHolding(false);
        if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
    };

    useEffect(() => {
        return () => {
          if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="w-full max-w-md flex flex-col items-center gap-8">
            <p className="font-tech text-center tracking-[0.2em] text-ash/70 uppercase">Objective: Purge Corrupted Node</p>
            <p className="text-center text-xs text-ash/50 max-w-xs">Hold to charge the purge sequence. Release before hitting instability spikes.</p>
            <div className="relative w-52 h-52 md:w-64 md:h-64">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="5" fill="none" />
                    {/* Progress */}
                    <circle cx="50" cy="50" r="45" stroke="#FF2A2A" strokeWidth="5" fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (progress / 100) * 283}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-100"
                    />
                    {/* Spikes */}
                    {spikes.map(spike => (
                        <rect key={spike} x="48" y="0" width="4" height="10" fill="#FF2A2A"
                              transform={`rotate(${spike * 3.6} 50 50)`} />
                    ))}
                 </svg>
                 <button 
                    onMouseDown={startProgress} onMouseUp={stopProgress} onMouseLeave={stopProgress}
                    onTouchStart={startProgress} onTouchEnd={stopProgress}
                    className={`absolute inset-10 rounded-full flex items-center justify-center text-2xl font-display uppercase tracking-widest
                    ${isHolding ? 'bg-neon-red text-black animate-pulse-fast shadow-[0_0_30px_#ff2a2a]' : 'bg-black/50 border-2 border-neon-red text-neon-red'}`}
                 >
                    Purge
                 </button>
            </div>
        </div>
    );
};