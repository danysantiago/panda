import java.util.ArrayList;
import java.util.Random;


class MemO {

	static Random r = new Random();
	
	public static void main(String[] args) {
		
		ArrayList<int[]> arr = new ArrayList<int[]>();
		
		while(true) {
			arr.add(new int[r.nextInt(10000)]);
		}


	}

}
