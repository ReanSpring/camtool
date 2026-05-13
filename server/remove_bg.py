import sys
import os
from rembg import remove, new_session
from PIL import Image, ImageOps

def process(input_path, output_path):
    try:
        input_image = Image.open(input_path)
        # Fix orientation before removing background
        input_image = ImageOps.exif_transpose(input_image)

        # Try multiple models if one fails to find anything
        # u2net is the standard, u2netp is faster/smaller, isnet is newer
        models = ["u2net", "u2netp", "isnet-general-use"]
        output_image = None
        
        for model_name in models:
            try:
                session = new_session(model_name)
                curr_output = remove(input_image, session=session)
                
                # Check if this model found anything (check max alpha)
                alpha_extrema = curr_output.getextrema()[3]
                if alpha_extrema[1] > 0: 
                    output_image = curr_output
                    break
            except Exception as e:
                sys.stderr.write(f"DEBUG: Model {model_name} failed: {e}\n")
                continue
        
        if output_image is None:
            # If all else fails, use u2net and hope for the best
            session = new_session("u2net")
            output_image = remove(input_image, session=session)

        output_image.save(output_path)
        print("Success")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input> <output>")
        sys.exit(1)
    process(sys.argv[1], sys.argv[2])
