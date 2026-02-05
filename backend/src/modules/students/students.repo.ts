import { db } from '../../connectors/db.js';

export interface StudentProfileData {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    major: string | null;
    gradYear: number | null;
    bio: string | null;
    skills: string[];
    resumeUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PortfolioItemData {
    id: string;
    profileId: string;
    title: string;
    description: string | null;
    url: string | null;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Find student profile by user ID
 */
export async function findByUserId(userId: string): Promise<StudentProfileData | null> {
    return db.studentProfile.findUnique({
        where: { userId },
    });
}

/**
 * Find student profile by profile ID
 */
export async function findById(id: string): Promise<StudentProfileData | null> {
    return db.studentProfile.findUnique({
        where: { id },
    });
}

/**
 * Find student profile with user info
 */
export async function findByIdWithUser(id: string) {
    return db.studentProfile.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    status: true,
                },
            },
        },
    });
}

/**
 * Update student profile
 */
export async function updateProfile(
    userId: string,
    data: Partial<Omit<StudentProfileData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<StudentProfileData> {
    return db.studentProfile.update({
        where: { userId },
        data,
    });
}

/**
 * Get portfolio items for a profile
 */
export async function getPortfolioItems(profileId: string): Promise<PortfolioItemData[]> {
    return db.portfolioItem.findMany({
        where: { profileId },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Create portfolio item
 */
export async function createPortfolioItem(
    profileId: string,
    data: Omit<PortfolioItemData, 'id' | 'profileId' | 'createdAt' | 'updatedAt'>
): Promise<PortfolioItemData> {
    return db.portfolioItem.create({
        data: {
            profileId,
            ...data,
        },
    });
}

/**
 * Find portfolio item by ID
 */
export async function findPortfolioItemById(id: string): Promise<PortfolioItemData | null> {
    return db.portfolioItem.findUnique({
        where: { id },
    });
}

/**
 * Update portfolio item
 */
export async function updatePortfolioItem(
    id: string,
    data: Partial<Omit<PortfolioItemData, 'id' | 'profileId' | 'createdAt' | 'updatedAt'>>
): Promise<PortfolioItemData> {
    return db.portfolioItem.update({
        where: { id },
        data,
    });
}

/**
 * Delete portfolio item
 */
export async function deletePortfolioItem(id: string): Promise<void> {
    await db.portfolioItem.delete({ where: { id } });
}

/**
 * Count portfolio items for a profile
 */
export async function countPortfolioItems(profileId: string): Promise<number> {
    return db.portfolioItem.count({ where: { profileId } });
}
