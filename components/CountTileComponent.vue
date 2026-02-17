<template>
	<span :style="{ color: fontColor }"><span :style="{ color: fontColor, fontWeight: 700 }">{{ count }}</span> {{ recordLabel }}</span>
</template>

<script>
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

export default {
	props: {
		fontColor: {
			type: String,
			default: 'inherit',
		},
	},
	setup() {
		const store = useMainStore();
		const count = computed(() => store.selectedStats.count);
		const recordLabel = computed(() => (count.value === 1 ? 'record' : 'records'));

		return {
			count,
			recordLabel,
		};
	},
};
</script>

