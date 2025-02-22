import pyttsx3

def text_to_speech(text, rate=150, voice=None):
    engine = pyttsx3.init()
    engine.setProperty('rate', rate)  # Adjust speed (default is 200)
    
    if voice is not None:
        voices = engine.getProperty('voices')
        if voice < len(voices):
            engine.setProperty('voice', voices[voice].id)  # Choose voice
        else:
            print("Invalid voice index. Using default voice.")
    
    engine.say(text)
    engine.runAndWait()

def list_voices():
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    for index, voice in enumerate(voices):
        print(f"Voice {index}: {voice.name} - {voice.languages}")

if __name__ == "__main__":
    list_voices()
    text = input("Enter text to convert to speech: ")
    rate = int(input("Enter speech rate (default is 150): ") or 150)
    voice_index = input("Enter voice index (default is 0): ")
    voice_index = int(voice_index) if voice_index else 0
    text_to_speech(text, rate, voice_index)