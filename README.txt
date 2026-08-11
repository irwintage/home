CHRYSASYNTH LIMINAL HOME

Put your Blender export here:

assets/sphere3state.glb

Then run through a local server, for example:
python -m http.server

Recommended Blender glTF export:
- glTF Binary (.glb)
- Cameras ON
- Punctual Lights ON
- Animations ON
- Sampling Animations ON
- Use Current Frame Range ON
- Limit to Playback Range ON
- Optimize Animations OFF

Important:
The current JS intentionally does NOT rebuild your Blender art direction.
It only:
- loads sphere3state.glb
- uses CINEMATIC_CAMERA
- scrubs animation with scroll
- adds light post-processing
- reveals the 3 glass cards at the end
