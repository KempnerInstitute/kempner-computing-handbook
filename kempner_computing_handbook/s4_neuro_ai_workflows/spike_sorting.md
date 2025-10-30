# Spike Sorting

Spike sorting is the process of identifying and extracting action potentials recorded extracellularly and classifying them based on their neuron of origin. It involves filtering raw neuronal signals, detecting the spikes, extracting features of single neuron spike waveforms, and clustering them into distinct neuronal units. Accurate sorting is essential for the study of neural coding and circuit dynamics but is difficult due to the presence of waveform overlaps, electrode drifts, and unavoidable noises.

![SegmentLocal](figures/gif/spikes.gif "segment")

<div style="text-align: center; font-size: 12px; max-width: 600px; margin: 0 auto;">
Raw voltage traces for extracellular recordings.
<p>Image credit: <a href="https://yliapis.github.io/A-Classical-Approach-to-Spike-Sorting/" target="_blank">Y. Liapis, A Classical Approach to Spike Sorting</a>.</p>
</div>

In collaboration with the [Allen Institute](https://alleninstitute.org/), the Kempner Research and Engineering team developed spike sorting pipelines to support researchers on the [FASRC](https://www.rc.fas.harvard.edu/) Cannon and [HMS RC](https://it.hms.harvard.edu/about/departments/research-computing) O2 computing clusters.

In order to utilize these pipelines for your spike sorting project on either computing cluster, follow the instructions below.

[Steps to run the spike sorting pipeline on the FASRC Cannon Cluster](https://github.com/KempnerInstitute/ephys-spike-sorting/tree/main/pipeline/kempner_cluster)
  
[Steps to run the spike sorting pipeline on the HMS O2 Cluster](https://github.com/KempnerInstitute/ephys-spike-sorting/tree/main/pipeline/hms_cluster)